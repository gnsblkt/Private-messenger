# Deploy the WebSocket signaling service

The Vercel frontend can remain at https://p2p-web-chat.vercel.app/. The signaling service is a separate long-running Node.js WebSocket server, described by `render.yaml`.

## Deploy

1. In Render, create a new Blueprint and select this repository.
2. Select branch `fix/persistent-websocket-signaling`.
3. Review the service named `p2p-web-chat-signaling` and deploy it.
4. After deployment, copy the service's public hostname, for example `https://YOUR-SERVICE.onrender.com`.

## Connect the chat app

On each device:

1. Open https://p2p-web-chat.vercel.app/.
2. Expand **Connection settings**.
3. Set the signaling URL to `wss://YOUR-SERVICE.onrender.com/api/ws`, replacing the example hostname with the actual Render hostname.
4. Tap **Save server URL**, then refresh the page.
5. On one device create a room and join it. On the other device, enter the exact same room ID and join.

The frontend's chat messages and file payloads are sent through WebRTC data channels; the signaling server relays room presence and WebRTC setup messages. The current signaling implementation keeps room membership in process memory, so use one running service instance unless shared state is added.

## Notes

- Use `wss://` for the public signaling URL.
- Render's free web services may spin down when idle, so the first connection after inactivity may take longer.
- Do not put private credentials in the frontend or in this file.
