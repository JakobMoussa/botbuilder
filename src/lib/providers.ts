import { createHash } from "node:crypto";
import { db } from "./db";
import { decrypt, HttpError } from "./security";
import { limitedText, safeFetch } from "./network";

export function localDeterministicEmbedding(text: string, dimensions = 1536): number[] {
  const vector = new Float64Array(dimensions);
  const normalized = text.toLowerCase().normalize("NFKD");
  const words = normalized.split(/[\s,.;:!?()[\]{}"'`«»„“”\-_/\\]+/).filter(Boolean);
  
  if (words.length === 0) {
    vector[0] = 1.0;
    return Array.from(vector);
  }

  for (const word of words) {
    const hash = createHash("sha256").update(word).digest();
    const idx = (hash.readUInt32BE(0) ^ hash.readUInt32BE(4)) % dimensions;
    const sign = (hash.readUInt8(8) % 2 === 0) ? 1 : -1;
    const weight = Math.log(1 + word.length);
    vector[idx] += sign * weight * 2.0;

    if (word.length >= 3) {
      for (let i = 0; i <= word.length - 3; i++) {
        const gram = word.slice(i, i + 3);
        const gHash = createHash("sha256").update("g:" + gram).digest();
        const gIdx = (gHash.readUInt32BE(0) ^ gHash.readUInt32BE(4)) % dimensions;
        const gSign = (gHash.readUInt8(8) % 2 === 0) ? 1 : -1;
        vector[gIdx] += gSign * 0.5;
      }
    }
  }

  let sumSq = 0;
  for (let i = 0; i < dimensions; i++) {
    sumSq += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sumSq) || 1.0;
  const result = new Array<number>(dimensions);
  for (let i = 0; i < dimensions; i++) {
    result[i] = Number((vector[i] / norm).toFixed(6));
  }
  return result;
}
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
export type ChatEvent = {
  text?: string;
  inputTokens?: number;
  outputTokens?: number;
};
export interface AIProvider {
  chat(input: {
    model: string;
    messages: ChatMessage[];
    temperature: number;
    maxTokens: number;
  }): AsyncGenerator<ChatEvent>;
  embeddings(
    texts: string[],
    model: string,
  ): Promise<{ vectors: number[][]; tokens: number }>;
  validateCredentials(): Promise<boolean>;
  getModels(): Promise<string[]>;
}
export class OpenAICompatibleProvider implements AIProvider {
  private key: string;
  private baseUrl: string;
  constructor(
    key: string,
    baseUrl: string,
  ) {
    this.key = key.trim().replace(/^["']|["']$/g, "");
    this.baseUrl = baseUrl.trim().replace(/^["']|["']$/g, "").replace(/\/$/, "");
  }
  private async request(path: string, body?: unknown) {
    const response = await safeFetch(this.baseUrl + path, {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new HttpError(
        502,
        `Der AI-Provider hat die Anfrage abgelehnt (HTTP ${response.status}). Bitte Zugang und Modell prüfen.`,
      );
    }
    return response;
  }
  async getModels() {
    const data = JSON.parse(await limitedText(await this.request("/models")));
    return (data.data as { id: string }[]).map((x) => x.id).sort();
  }
  async validateCredentials() {
    await this.getModels();
    return true;
  }
  private static unsupportedEmbeddingUrls = new Set<string>();

  async embeddings(texts: string[], model: string) {
    if (!OpenAICompatibleProvider.unsupportedEmbeddingUrls.has(this.baseUrl)) {
      try {
        const response = await this.request("/embeddings", {
          input: texts,
          model,
          dimensions: 1536,
        });
        const data = JSON.parse(await limitedText(response, 8_000_000));
        const vectors: number[][] = data.data
          .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
          .map((x: { embedding: number[] }) => x.embedding);
        if (
          vectors.length === texts.length &&
          vectors.every(
            (x) => x.length === 1536 && x.every((n) => Number.isFinite(n)),
          )
        ) {
          return { vectors, tokens: Number(data.usage?.total_tokens || 0) };
        }
      } catch {
        OpenAICompatibleProvider.unsupportedEmbeddingUrls.add(this.baseUrl);
      }
    }
    const vectors = texts.map((t) => localDeterministicEmbedding(t, 1536));
    const tokens = Math.ceil(texts.reduce((sum, t) => sum + t.length, 0) / 4);
    return { vectors, tokens };
  }
  async *chat(input: {
    model: string;
    messages: ChatMessage[];
    temperature: number;
    maxTokens: number;
  }) {
    const response = await this.request("/chat/completions", {
      model: input.model,
      messages: input.messages,
      temperature: input.temperature,
      max_tokens: input.maxTokens,
      stream: true,
      stream_options: { include_usage: true },
      store: false,
    });
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "",
      size = 0,
      completed = false;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 4_000_000)
          throw new HttpError(502, "Provider-Antwort zu groß.");
        buffer += decoder.decode(value, { stream: true });
        let pos: number;
        while ((pos = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, pos).trim();
          buffer = buffer.slice(pos + 1);
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (raw === "[DONE]") {
            completed = true;
            return;
          }
          const event = JSON.parse(raw);
          if (event.error)
            throw new HttpError(502, "Provider-Stream fehlgeschlagen.");
          if (event.choices?.[0]?.delta?.content)
            yield { text: event.choices[0].delta.content };
          if (event.usage)
            yield {
              inputTokens: event.usage.prompt_tokens,
              outputTokens: event.usage.completion_tokens,
            };
        }
      }
      if (!completed)
        throw new HttpError(502, "Provider-Stream wurde unterbrochen.");
    } finally {
      await reader.cancel();
    }
  }
}
export async function providerFor(
  workspaceId: string,
  providerId?: string | null,
): Promise<AIProvider> {
  if (providerId) {
    const credential = await db.aIProviderCredential.findFirst({
      where: { id: providerId, workspaceId },
    });
    if (!credential) throw new HttpError(400, "Provider nicht gefunden.");
    return new OpenAICompatibleProvider(
      decrypt(credential.encryptedKey),
      credential.baseUrl,
    );
  }
  if (process.env.OPENAI_API_KEY)
    return new OpenAICompatibleProvider(
      process.env.OPENAI_API_KEY,
      "https://api.openai.com/v1",
    );
  throw new HttpError(
    400,
    "Bitte zuerst unter Einstellungen einen AI-Provider verbinden und im Bot auswählen.",
  );
}
