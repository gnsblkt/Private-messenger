const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { attachSignaling } = require("./signaling");

const port = Number(process.env.PORT || 8080);
const server = createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
  res.end("Private Messenger signaling server is running.\n");
});
const wss = new WebSocketServer({ server, path: "/api/ws", maxPayload: 1024 * 1024 });
attachSignaling(wss);
server.listen(port, "0.0.0.0", () => {
  console.log(`Signaling server listening on port ${port}`);
});
