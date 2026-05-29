# c/decispher-official-mpkarwbs/coding-convention — Coding Convention

Conventions we use in our coding style

6 context units. Full bodies served via `get_context_for_topic({ topic: "c/decispher-official-mpkarwbs/coding-convention" })`.

## Spine (always applies)

### All money amounts stored as integer minor units (cents), never floats
Severity: CRITICAL · Status: active · Type: constraint

Every monetary value in the database, API, and domain layer MUST be represented as an integer count of minor units (e.g. cents for USD) using a bigint/number-as-integer column named with a `_cents` suffix. Floating-point types (float, double, JS number used as decimal) are forbidden for money. Formatting to a decimal string happens only at the UI boundary.

### Realtime socket must use a short-lived one-time ticket, not the session token in the URL
Severity: CRITICAL · Status: active · Type: constraint

Open the realtime websocket with a single-use short-lived ticket from the ticket endpoint; never put the long-lived session token in the websocket URL.

### WebSocket auth via short-lived ticket, never the long-lived session JWT in the URL
Severity: CRITICAL · Status: active · Type: constraint

Clients MUST open the realtime WebSocket using a single-use, 30-second ticket obtained from POST /realtime/ticket (authenticated by the normal session). The long-lived session JWT MUST NOT be placed in the ws:// URL query string or any logged location. The server validates and burns the ticket on connection upgrade.

## Units in this topic

- **Idempotency-Key required on all checkout/charge POST endpoints** (id: f90be491-0af7-4fea-9540-9f50d440579d) · convention · HIGH
- **Inventory reservation uses SELECT ... FOR UPDATE, not optimistic retry** (id: 7fbfbfac-5fa2-449b-b8ce-fd4d62d240b9) · decision · HIGH
- **Realtime presence/typing events broadcast over Redis Pub/Sub, never stored in Postgres** (id: 2215fc46-4754-420d-9c78-d8476116d5c2) · convention · MEDIUM

For the full body of any unit: `get_decision({ decisionId: "<id>" })`.

For the curated topic context bundle: `get_context_for_topic({ topic: "c/decispher-official-mpkarwbs/coding-convention" })`.
