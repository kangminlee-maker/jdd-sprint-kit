# Preview Server Management

## Startup Rule

When starting a preview dev server (`npm run dev` or `npx vite`), always kill existing processes on the target port first.

```bash
lsof -ti:{PORT} | xargs kill -9 2>/dev/null; sleep 1 && npx vite --host
```

## Why

Multiple Vite instances on the same port cause:
- HMR (Hot Module Replacement) failure: browser WebSocket connects to the first server, subsequent servers' file-change events are not delivered
- Port conflicts and silent fallback to different ports
- Stale process accumulation across restart attempts

## Single Instance Rule

Only one preview server process should run at a time. Before starting a new server:
1. Kill all existing Vite processes on the target port
2. Verify port is free
3. Start the new server

## Default Port

- Preview prototype: `5173` (Vite default)
