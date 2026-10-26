process.stdin.destroy();
const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

console.log("Initializing Next.js (dev=" + dev + ")...");
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let isReady = false;
const preparePromise = app.prepare().then(() => {
  isReady = true;
  console.log("> Next.js app prepared and ready to handle requests.");
}).catch((err) => {
  console.error("Next.js prepare failed:", err);
  process.exit(1);
});

const server = createServer(async (req, res) => {
  try {
    if (!isReady) {
      await preparePromise;
    }
    await handle(req, res);
  } catch (err) {
    console.error("Error handling request:", req.url, err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
});

server.listen(port, () => {
  console.log(`> Server successfully listening on http://${hostname}:${port}`);
});
