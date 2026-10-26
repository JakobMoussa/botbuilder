import { lookup } from "node:dns/promises";
import https from "node:https";
import http from "node:http";
import { Readable } from "node:stream";
import ipaddr from "ipaddr.js";
import { HttpError } from "./security";
export function isPublicAddress(address: string) {
  try {
    return ipaddr.process(address).range() === "unicast";
  } catch {
    return false;
  }
}
export async function safeFetch(
  input: string,
  init: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    timeout?: number;
  } = {},
) {
  const url = new URL(input);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && !["443", "80"].includes(url.port))
  )
    throw new HttpError(400, "Diese URL ist nicht erlaubt.");
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some((x) => !isPublicAddress(x.address)))
    throw new HttpError(400, "Private Netzwerkziele sind nicht erlaubt.");
  const pinned = addresses[0];
  return new Promise<Response>((resolve, reject) => {
    // Pin the validated DNS address for the actual connection (DNS rebinding defense).
    const request = (url.protocol === "https:" ? https : http).request(
      url,
      {
        method: init.method || "GET",
        headers: init.headers,
        lookup: (_host, options, callback) => {
          const cb = typeof options === "function" ? options : callback;
          const isAll = typeof options === "object" && options !== null && Boolean((options as { all?: boolean }).all);
          return isAll
            ? cb(null, [{ address: pinned.address, family: pinned.family }])
            : cb(null, pinned.address, pinned.family);
        },
      },
      (response) => {
        const headers = new Headers();
        for (const [key, value] of Object.entries(response.headers))
          if (value)
            headers.set(key, Array.isArray(value) ? value.join(", ") : value);
        response.on("end", () => clearTimeout(timer));
        response.on("close", () => clearTimeout(timer));
        resolve(
          new Response(Readable.toWeb(response) as ReadableStream<Uint8Array>, {
            status: response.statusCode || 502,
            headers,
          }),
        );
      },
    );
    const timer = setTimeout(
      () => request.destroy(new Error("Network timeout")),
      init.timeout || 60000,
    );
    request.on("error", () => {
      clearTimeout(timer);
      reject(new HttpError(502, "Der externe Dienst ist nicht erreichbar."));
    });
    if (init.body) request.write(init.body);
    request.end();
  });
}
export async function limitedText(response: Response, max = 2_000_000) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      throw new HttpError(413, "Externe Antwort ist zu groß.");
    }
    parts.push(value);
  }
  return Buffer.concat(parts).toString("utf8");
}
