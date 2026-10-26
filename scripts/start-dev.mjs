import { createServer } from "http";
import next from "next";

const dev = true;
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log("> Preparing Next.js app...");
app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error("> Error starting Next.js dev server:", err);
  process.exit(1);
});
