const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { attachSignaling } = require("../server/signaling");

const server = createServer();
const wss = new WebSocketServer({ server, path: "/api/ws", maxPayload: 1024 * 1024 });
attachSignaling(wss);

module.exports = server;
