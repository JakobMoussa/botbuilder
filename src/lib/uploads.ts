import { HttpError, readBody } from "./security";
import { spawn } from "node:child_process";
import path from "node:path";
async function parseDocument(buffer: Buffer, type: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        "--max-old-space-size=192",
        "--import",
        "tsx",
        path.join(process.cwd(), "scripts/extract-file.ts"),
        type,
      ],
      {
        stdio: ["pipe", "pipe", "ignore"],
        env: { PATH: process.env.PATH, NODE_ENV: "production" },
      },
    );
    const fail = () => {
      clearTimeout(timer);
      child.kill("SIGKILL");
      reject(
        new HttpError(
          400,
          "Dokument konnte nicht gelesen werden. Maximal 100 PDF-Seiten und 500.000 Textzeichen; verschlüsselte oder beschädigte Dateien werden abgewiesen.",
        ),
      );
    };
    const timer = setTimeout(fail, 20000);
    child.stdout.setEncoding("utf8");
    let output = "";
    child.stdout.on("data", (data) => {
      output += data.toString("utf8");
      if (output.length > 3000000) fail();
    });
    child.on("error", fail);
    child.stdin.on("error", fail);
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        fail();
        return;
      }
      try {
        resolve(JSON.parse(output).text);
      } catch {
        fail();
      }
    });
    child.stdin.end(buffer);
  });
}
export async function extractUpload(request: Request) {
  const bytes = await readBody(request, 5 * 1024 * 1024 + 20000);
  const form = await new Response(new Uint8Array(bytes), {
    headers: { "Content-Type": request.headers.get("content-type") || "" },
  }).formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size > 5 * 1024 * 1024 || !file.size)
    throw new HttpError(400, "Bitte eine Datei mit maximal 5 MB auswählen.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase();
  let content = "",
    type = "";
  if (
    ext === "pdf" &&
    file.type === "application/pdf" &&
    buffer.subarray(0, 5).toString() === "%PDF-"
  ) {
    content = await parseDocument(buffer, "PDF");
    type = "PDF";
  } else if (
    ext === "docx" &&
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
    buffer.length >= 4 &&
    buffer.readUInt32LE(0) === 0x04034b50
  ) {
    // Bound declared expanded ZIP size before handing the document to the parser.
    let expanded = 0,
      entries = 0;
    for (let i = 0; i + 46 <= buffer.length; i++)
      if (buffer.readUInt32LE(i) === 0x02014b50) {
        expanded += buffer.readUInt32LE(i + 24);
        entries++;
      }
    if (
      !entries ||
      entries > 2000 ||
      expanded > 20 * 1024 * 1024 ||
      expanded === 0
    )
      throw new HttpError(400, "DOCX-Datei ist zu groß oder ungültig.");
    content = await parseDocument(buffer, "DOCX");
    type = "DOCX";
  } else if (
    ["txt", "md", "markdown"].includes(ext || "") &&
    ["text/plain", "text/markdown", "text/x-markdown", ""].includes(file.type)
  ) {
    content = buffer.toString("utf8");
    if (content.includes("\u0000"))
      throw new HttpError(400, "Binäre Dateien sind nicht erlaubt.");
    type = ext === "txt" ? "TXT" : "MARKDOWN";
  } else
    throw new HttpError(
      400,
      "Dateityp oder MIME-Typ nicht erlaubt. Nutze TXT, Markdown, PDF oder DOCX.",
    );
  if (!content.trim() || content.length > 500000)
    throw new HttpError(
      400,
      "Die Datei muss auslesbaren Text enthalten (maximal 500.000 Zeichen).",
    );
  return { name: file.name.slice(0, 200), content, type };
}
