const rooms = new Map();
const MAX_MESSAGE_BYTES = 1024 * 1024;

function send(ws, payload) {
  if (ws.readyState === 1) ws.send(JSON.stringify(payload));
}

function detach(ws) {
  if (!ws.roomId || !ws.peerId) return;
  const room = rooms.get(ws.roomId);
  if (room) {
    room.delete(ws.peerId);
    for (const peer of room.values()) send(peer, { type: "peer-left", peerId: ws.peerId });
    if (room.size === 0) rooms.delete(ws.roomId);
  }
  ws.roomId = null;
  ws.peerId = null;
}

function attachSignaling(wss) {
  wss.on("connection", (ws) => {
    ws.on("message", (raw) => {
      if (raw.length > MAX_MESSAGE_BYTES) {
        ws.close(1009, "Message too large");
        return;
      }

      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        send(ws, { type: "error", message: "Invalid JSON message." });
        return;
      }

      if (msg.type === "join") {
        const roomId = String(msg.roomId || "").trim().slice(0, 80);
        const peerId = String(msg.peerId || "").trim().slice(0, 100);
        const name = String(msg.name || "Anonymous").trim().slice(0, 40) || "Anonymous";
        if (!roomId || !peerId) {
          send(ws, { type: "error", message: "Room ID and peer ID are required." });
          return;
        }

        detach(ws);
        let room = rooms.get(roomId);
        if (!room) {
          room = new Map();
          rooms.set(roomId, room);
        }
        const existing = [...room.values()].filter((peer) => peer.peerId !== peerId);
        ws.roomId = roomId;
        ws.peerId = peerId;
        ws.name = name;
        room.set(peerId, ws);
        send(ws, {
          type: "joined",
          roomId,
          peerId,
          peers: existing.map((peer) => ({ peerId: peer.peerId, name: peer.name || "Anonymous" }))
        });
        for (const peer of existing) {
          send(peer, { type: "peer-joined", peerId, name });
        }
        return;
      }

      if (!ws.roomId || !ws.peerId) {
        send(ws, { type: "error", message: "Join a room before signaling." });
        return;
      }

      if (["offer", "answer", "ice"].includes(msg.type)) {
        const room = rooms.get(ws.roomId);
        const target = room && room.get(String(msg.to || ""));
        if (!target || target.readyState !== 1) {
          send(ws, { type: "error", message: "That peer is no longer in this room." });
          return;
        }
        send(target, {
          type: msg.type,
          from: ws.peerId,
          name: ws.name || "Anonymous",
          description: msg.description,
          candidate: msg.candidate
        });
        return;
      }

      if (msg.type === "leave") {
        detach(ws);
        send(ws, { type: "left" });
        return;
      }

      send(ws, { type: "error", message: "Unsupported signaling message." });
    });

    ws.on("close", () => detach(ws));
    ws.on("error", () => detach(ws));
  });
}

module.exports = { attachSignaling };
