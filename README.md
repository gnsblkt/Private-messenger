# Private Messenger

A browser-based WebRTC chat prototype. Chat text and file chunks travel over WebRTC data channels, which are protected by WebRTC's DTLS transport encryption. The signaling service exchanges room membership, SDP offers/answers, and ICE candidates; it does not relay chat messages.

## Deploy the frontend and signaling endpoint

- The static frontend is `index.html`.
- `api/ws.js` exposes a WebSocket endpoint at `/api/ws` for Vercel deployments that support WebSocket upgrades.
- `server/signalingServer.js` runs the same signaling protocol as a standalone Node server (`npm install && npm start`), for local use or a separate long-running host.

### Vercel

Deploy the repository with the Vercel project root at the repository root. The browser defaults to `wss://<your-vercel-domain>/api/ws` on HTTPS. The WebSocket endpoint uses in-memory room state. Vercel can place separate WebSocket connections on different function instances, and in-memory room state is not shared between instances. Therefore, the Vercel endpoint is suitable for initial smoke tests but is not a guarantee of cross-instance room discovery. Reliable production use across instances requires shared presence/signaling coordination (for example, a Redis-backed broker) or a single long-running signaling process.

### Separate signaling server (recommended for this prototype)

Deploy this repository's Node service on a long-running Node host:

- Build/install command: `npm install`
- Start command: `npm start`
- The service listens on `process.env.PORT` (defaults to 8080) and serves WebSockets at `/api/ws`.

In the web app, open **Connection settings**, enter the host's secure WebSocket URL (for example, `wss://your-service.example/api/ws`), and choose **Save server URL**. Use `wss://` for a secure host when the frontend is served over HTTPS.

## Local development

1. Run `npm install`.
2. Run `npm start`.
3. Serve `index.html` from a local HTTP server (not `file://`) and set Connection settings to `ws://localhost:8080/api/ws`.
4. Open the same page in two browsers/devices and join the same room ID.

## Limitations and security notes

- This is a lightweight prototype, not a security-audited messenger.
- Room IDs act as room locators, not user authentication. Use long, randomly generated IDs and share them only with intended peers.
- WebRTC data channels encrypt traffic in transit between connected peers, but this prototype does not implement identity verification, forward secrecy, or a custom cryptographic protocol.
- WebRTC connections can fail on restrictive networks without a TURN relay. STUN alone cannot guarantee connectivity on every network.
- File sharing is limited to 10 MB per file in the browser client.
- No chat history is persisted by the signaling server; reloading the page clears the displayed session history.
