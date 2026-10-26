// Run in a separate bounded process; untrusted parsers never share the web heap.
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
async function main() {
  const parts: Buffer[] = [];
  let bytes = 0;
  for await (const part of process.stdin) {
    bytes += part.length;
    if (bytes > 5 * 1024 * 1024) throw new Error("File too large");
    parts.push(part);
  }
  const buffer = Buffer.concat(parts);
  let text: string;
  if (process.argv[2] === "PDF") {
    const parser = new PDFParse({
      data: new Uint8Array(buffer),
      isEvalSupported: false,
    });
    try {
      const info = await parser.getInfo();
      if (info.total > 100) throw new Error("At most 100 pages");
      text = (await parser.getText()).text;
    } finally {
      await parser.destroy();
    }
  } else text = (await mammoth.extractRawText({ buffer })).value;
  if (text.length > 500000) throw new Error("Extracted text too large");
  process.stdout.write(JSON.stringify({ text }));
}
main().catch(() => {
  process.exitCode = 1;
});
