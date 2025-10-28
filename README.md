
# DevLoop (Monorepo)

This repo contains the DevLoop DSA community app.

## Structure
- apps/web — React + Vite frontend
- services/gateway — FastAPI HTTP API (Cloud Run)
- services/agents — ADK agents (curator, poll, summarizer)
- services/mcp — MCP server exposing Firestore/Storage tools
- services/gpu — GPU reranker service (Cloud Run GPU)
- packages/* — shared libs (TS types, Python helpers)
- docs — architecture, API, data model, runbook
- infra — scripts/env for deploy & dev

See docs/ARCHITECTURE.md for the diagram and flow.
