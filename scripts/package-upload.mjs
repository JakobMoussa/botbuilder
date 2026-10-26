import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "upload");
const target = join(output, "dialogue");
const archive = join(output, "dialogue-upload.zip");
// Only these application files enter the package. Never copy the project root.
const entries = [
  "src", "prisma", "public/chatbot.js", "scripts/boot.mjs", "scripts/extract-file.ts",
  "package.json", "package-lock.json", ".npmrc", "next.config.ts", "next-env.d.ts",
  "tsconfig.json", "postcss.config.mjs", "Dockerfile", ".dockerignore",
];
const templates = [
  ["deploy/docker-compose.yml", "docker-compose.yml"],
  ["deploy/.env.example", ".env.example"],
  ["deploy/UPLOAD.md", "UPLOAD.md"],
  ["docs/FIREBASE-AUTH.md", "FIREBASE-AUTH.md"],
  ["docs/IONOS-START.md", "IONOS-START.md"],
];
const forbidden = /(^\.env($|\.)|\.env$|firebase-adminsdk|service-account|credentials|secrets|\.(pem|key|p12|pfx|log|tsbuildinfo|dump)$|\.sql\.gz$|^\.DS_Store$|^(node_modules|\.next|\.git|\.agents|\.codex|runtime|backups|test-results)$)/i;
function checkSource(path) {
  const info = lstatSync(path);
  if (info.isSymbolicLink()) throw new Error(`Symlinks are not allowed in upload sources: ${path}`);
  if (info.isDirectory()) {
    for (const name of readdirSync(path)) {
      if (forbidden.test(name)) continue;
      checkSource(join(path, name));
    }
  }
}
for (const entry of [...entries, ...templates.map(([source]) => source)]) {
  const path = join(root, entry);
  if (!existsSync(path)) throw new Error(`Required upload source missing: ${entry}`);
  checkSource(path);
}
// Remove only this script's generated package, never other files under upload/.
mkdirSync(output, { recursive: true });
if (lstatSync(output).isSymbolicLink()) throw new Error("upload/ must not be a symlink.");
rmSync(target, { recursive: true, force: true });
rmSync(archive, { force: true });
mkdirSync(target);
for (const [source, destination] of [...entries.map((entry) => [entry, entry]), ...templates]) {
  const destinationPath = join(target, destination);
  mkdirSync(dirname(destinationPath), { recursive: true });
  cpSync(join(root, source), destinationPath, {
    recursive: true,
    filter: (path) => source.startsWith("deploy/") || !forbidden.test(basename(path)),
  });
}
const result = spawnSync("zip", ["-q", "-r", archive, "dialogue"], { cwd: output, stdio: "inherit" });
if (result.error || result.status !== 0) {
  rmSync(archive, { force: true });
  throw new Error(`ZIP creation failed. Install zip or upload the prepared folder: ${target}`);
}
console.log(`Upload archive: ${archive}\nUpload folder: ${target}\nServer instructions: ${join(target, "UPLOAD.md")}`);
