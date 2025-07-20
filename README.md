# WebRTC Signaling Server

This is the signaling server for the Flutter live streaming app.

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Server Information

- **Port**: 3000 (default) or PORT environment variable
- **Health Check**: GET /health
- **Status**: GET /

## Deployment

You can deploy this server to:
- Heroku
- Railway.app
- Render.com
- Any Node.js hosting platform

Make sure to update the server URL in your Flutter app after deployment.
