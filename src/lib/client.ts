export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch("/api/" + path, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok)
    throw new APIError(
      data.error || "Anfrage fehlgeschlagen.",
      response.status,
    );
  return data as T;
}
export const write = <T>(path: string, data: unknown, method = "POST") =>
  api<T>(path, { method, body: JSON.stringify(data) });
export const number = (n: number) =>
  new Intl.NumberFormat("de-DE", {
    notation: n > 99999 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(n);
export const money = (n: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 4,
  }).format(n);
export const date = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Noch keine Aktivität";
export type Settings = {
  providerId: string | null;
  model: string;
  embeddingModel: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  language: string;
  unknownAnswer: string;
  similarityThreshold: number;
  storeConversations: boolean;
  analyticsEnabled: boolean;
  retentionDays: number;
  inputCostPerMillion: number;
  outputCostPerMillion: number;
  embeddingCostPerMillion: number;
  dailyRequestLimit: number;
};
export type Widget = {
  displayName: string;
  greeting: string;
  placeholder: string;
  primaryColor: string;
  textColor: string;
  avatarUrl: string;
  logoUrl: string;
  buttonIcon: string;
  position: string;
  radius: number;
  theme: string;
  branding: boolean;
};
export type Bot = {
  id: string;
  publicId: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
  lastActivity: string | null;
  settings: Settings;
  widget: Widget;
  domains: { domain: string }[];
  _count: { sources: number; conversations: number };
  stats?: { messages: number; tokens: number; cost: number };
};
export type Provider = {
  id: string;
  name: string;
  baseUrl: string;
  keyLastFour: string;
};
export type Source = {
  id: string;
  name: string;
  type: string;
  status: string;
  error?: string;
  indexedAt: string | null;
  _count: { chunks: number };
  bot?: { id: string; name: string };
};
export type Conversation = {
  id: string;
  createdAt: string;
  preview: boolean;
  bot?: { id: string; name: string };
  messages: { id: string; role: string; content: string; createdAt: string }[];
  _count?: { messages: number };
  usage: { inputTokens: number; outputTokens: number; cost: number }[];
};
export type Analytics = {
  conversations: number;
  messages: number;
  uniqueSessions: number;
  tokens: number;
  cost: number;
  latencyMs: number;
  requests: number;
  series: { date: string; messages: number; cost: number }[];
  questions: { content: string; count: number }[];
  weakQuestions: { content: string }[];
  feedback: { feedback: number; _count: number }[];
};
