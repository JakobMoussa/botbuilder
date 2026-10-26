import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
const mode = process.argv[2];
const path = "/app/runtime/secrets.json";
if (mode === "init" && !existsSync(path)) {
  mkdirSync("/app/runtime", { recursive: true });
  writeFileSync(
    path,
    JSON.stringify({
      AUTH_SECRET: randomBytes(32).toString("hex"),
      ENCRYPTION_KEY: randomBytes(32).toString("hex"),
    }),
    { mode: 0o600, flag: "wx" },
  );
}
const generated = JSON.parse(readFileSync(path, "utf8"));
for (const key of ["AUTH_SECRET", "ENCRYPTION_KEY"])
  process.env[key] ||= generated[key];
const commands = {
  init: ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  web: ["node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0"],
  worker: ["--import", "tsx", "src/worker.ts"],
};
const child = spawn(process.execPath, commands[mode], {
  stdio: "inherit",
  env: process.env,
});
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 1));
