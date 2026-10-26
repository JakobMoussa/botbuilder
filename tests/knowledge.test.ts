import { describe, it, expect } from "vitest";
import { chunkText } from "../src/lib/knowledge";
import { isPublicAddress } from "../src/lib/network";
describe("RAG ingestion boundaries", () => {
  it("preserves text across bounded overlapping chunks", () => {
    const input = "Knowledge ".repeat(800);
    const chunks = chunkText(input);
    expect(chunks.length).toBeGreaterThan(3);
    expect(chunks.every((x) => x.length <= 1800)).toBe(true);
    expect(chunks[1].slice(0, 200)).toBe(chunks[0].slice(-200));
    expect(chunkText("   ")).toEqual([]);
  });
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "::1",
    "::ffff:127.0.0.1",
    "fc00::1",
    "fe80::1",
  ])("blocks private/reserved target %s", (value) =>
    expect(isPublicAddress(value)).toBe(false),
  );
  it("allows public network addresses", () => {
    expect(isPublicAddress("8.8.8.8")).toBe(true);
    expect(isPublicAddress("2606:4700:4700::1111")).toBe(true);
  });
});
