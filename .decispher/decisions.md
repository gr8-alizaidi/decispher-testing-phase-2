<!-- DECISION-8BE35AC2 -->
## Decision: All money amounts stored as integer minor units (cents), never floats

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Critical

**Files**:
- `src/db/schema/orders.ts`
- `src/services/cart.ts`
- `src/services/checkout.ts`

### Context

**Decision:** Every monetary value in the database, API, and domain layer MUST be represented as an integer count of minor units (e.g. cents for USD) using a bigint/number-as-integer column named with a `_cents` suffix. Floating-point types (float, double, JS number used as decimal) are forbidden for money. Formatting to a decimal string happens only at the UI boundary.

---

<!-- DECISION-B814B2E5 -->
## Decision: Realtime socket must use a short-lived one-time ticket, not the session token in the URL

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Critical

**Files**:
- `**/*`

### Context

**Decision:** Open the realtime websocket with a single-use short-lived ticket from the ticket endpoint; never put the long-lived session token in the websocket URL.

---

<!-- DECISION-DF0A62FD -->
## Decision: Strict Prohibition on Storing Raw Payment Card Numbers

**Status**: Active  
**Date**: 2026-05-28  
**Severity**: Critical

**Files**:
- `src/payment/processor.ts`
- `db/schema/payments.sql`

**Rules**:
```json
{
  "conditions": [
    {
      "type": "file",
      "pattern": "{src/payment/processor.ts,db/schema/payments.sql}",
      "content_rules": [
        {
          "mode": "regex",
          "start": 0,
          "pattern": "(?i)(raw_pan|card_number|credit_card_number|full_pan|account_number)"
        }
      ],
      "content_match_mode": "any"
    }
  ],
  "match_mode": "any"
}
```

### Context

**Decision:** The system must not store raw card numbers (PAN). All payment processing must occur via Stripe tokenization, storing only the Stripe token and the last four digits of the card.

---

<!-- DECISION-A420DF60 -->
## Decision: WebSocket auth via short-lived ticket, never the long-lived session JWT in the URL

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Critical

**Files**:
- `src/realtime/gateway.ts`
- `src/realtime/ticket.ts`
- `src/auth/session.ts`

### Context

**Decision:** Clients MUST open the realtime WebSocket using a single-use, 30-second ticket obtained from POST /realtime/ticket (authenticated by the normal session). The long-lived session JWT MUST NOT be placed in the ws:// URL query string or any logged location. The server validates and burns the ticket on connection upgrade.

---

<!-- DECISION-E4AE823C -->
## Decision: Document edits use server-authoritative CRDT merge, not last-write-wins

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Critical

**Files**:
- `src/realtime/crdt.ts`
- `src/realtime/document-service.ts`

### Context

**Decision:** Concurrent edits to a shared document are merged with a server-authoritative CRDT (Yjs-style) sequence. Each client sends ops against a vector clock; the server is the single sequencer that resolves and rebroadcasts the merged state. We do NOT use last-write-wins on whole-document saves.

---

<!-- DECISION-26C9C1C0 -->
## Decision: Establish naming convention for database columns and API JSON fields

**Status**: Active  
**Date**: 2026-05-28  
**Severity**: Critical

**Files**:
- `services/orders-service/`
- `db/schema`
- `api/routes`

**Rules**:
```json
{
  "conditions": [
    {
      "type": "file",
      "pattern": "services/orders-service/**",
      "content_rules": [
        {
          "mode": "string",
          "patterns": [
            "mongodb",
            "mongo"
          ]
        }
      ],
      "content_match_mode": "any"
    }
  ],
  "match_mode": "any"
}
```

### Context

**Decision:** Use snake_case for all PostgreSQL columns and camelCase for all JSON fields at the API boundary, utilizing the Drizzle ORM layer to handle the mapping between these two formats.

---

<!-- DECISION-F90BE491 -->
## Decision: Idempotency-Key required on all checkout/charge POST endpoints

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Critical

**Files**:
- `src/routes/checkout.ts`
- `src/routes/refunds.ts`
- `src/middleware/idempotency.ts`

### Context

**Decision:** Every state-mutating payment endpoint (create-order, charge, refund) MUST accept an `Idempotency-Key` request header, persist the first response keyed by it, and return that stored response verbatim on any retry with the same key for 24 hours. Handlers must look up the key before doing any work.

---

<!-- DECISION-7FBFBFAC -->
## Decision: Inventory reservation uses SELECT ... FOR UPDATE, not optimistic retry

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Critical

**Files**:
- `src/services/inventory.ts`
- `src/services/checkout.ts`

### Context

**Decision:** Stock decrements during checkout acquire a row-level lock via `SELECT quantity FROM inventory WHERE sku = $1 FOR UPDATE` inside the order transaction, then update within the same transaction. We do NOT use optimistic concurrency (version column + retry loop) for inventory.

---

<!-- DECISION-2671835C -->
## Decision: Keep the Phase 1 / Phase 2 boundary: capture creates records, Guardian enforces

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Critical

**Files**:
- `phase-2/phase2_architecture_plan.md.resolved`

### Context

**Decision:** Phase 2 (capture) must only create/enrich decision records; it must not perform enforcement. Blocking PRs/code changes that violate decisions is the exclusive responsibility of Phase 1 (Decision Guardian), which reads the records Phase 2 produces.

---

<!-- DECISION-DFAE8267 -->
## Decision: Migrate from Umbraco to Contentful for CMS functionality

**Status**: Active  
**Date**: 2026-05-26  
**Severity**: Critical

**Files**:
- `infrastructure/cms`
- `frontend/content-integration`

**Rules**:
```json
{
  "conditions": [
    {
      "type": "file",
      "pattern": "infrastructure/cms/**/*",
      "content_rules": [
        {
          "mode": "string",
          "patterns": [
            "Umbraco",
            ".NET",
            "Windows"
          ]
        }
      ]
    },
    {
      "type": "file",
      "pattern": "frontend/content-integration/**/*",
      "content_rules": [
        {
          "mode": "string",
          "patterns": [
            "Umbraco",
            ".NET"
          ]
        }
      ]
    }
  ],
  "match_mode": "any"
}
```

### Context

**Decision:** Replace the planned Umbraco CMS implementation with Contentful as a headless CMS solution, delivering content via REST and GraphQL APIs.

---

<!-- DECISION-4DDF24A6 -->
## Decision: Phase 2 is the Decision Capture Engine (capture & intelligence layer)

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Critical

**Files**:
- `phase-2/phase2_architecture_plan.md.resolved`
- `phase-2/ARCHITECTURE.md`

### Context

**Decision:** Phase 2 of Decispher builds the "Decision Capture Engine": a system that transforms raw real-world activity (Slack conversations, code changes, agent actions) into structured decision records automatically. It is the capture & intelligence layer, distinct from Phase 1 (Decision Guardian), which is the enforcement layer that reads existing decision records and blocks PRs/code changes that violate them.

---

<!-- DECISION-B0A3128B -->
## Decision: Phase 2 pipeline: Sources → Recorders → Core Intelligence → Notifications → Dashboard

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Critical

**Files**:
- `phase-2/phase2_architecture_plan.md.resolved`
- `phase-2/ARCHITECTURE.md`

### Context

**Decision:** The system is structured as a staged pipeline: Data Sources (Slack conversations, code changes from agent PRs/commits) feed Recorders (Slack Recorder Bot, Code Change Recorder), which push to Core Intelligence (Message Queue + Analyzer Service + Decision Store), which triggers a Notification Service, surfaced through a Decision Management Dashboard.

---

<!-- DECISION-C516730E -->
## Decision: An LLM-powered Analyzer Service turns raw activity into structured decisions

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Warning

**Files**:
- `phase-2/phase2_architecture_plan.md.resolved`

**Rules**:
```json
{
  "conditions": [
    {
      "type": "file",
      "pattern": "phase-2/phase2_architecture_plan.md.resolved",
      "content_rules": [
        {
          "mode": "regex",
          "pattern": "(?i)(?!(.*LLM.*|.*Large Language Model.*)).*Analyzer Service.*"
        }
      ],
      "content_match_mode": "all"
    }
  ],
  "match_mode": "all"
}
```

### Context

**Decision:** The Analyzer Service is LLM-powered: it consumes queued raw activity (Slack threads, code changes) and extracts structured decision records (the substance, rationale, and metadata) that are then written to the Decision Store.

---

<!-- DECISION-430932A3 -->
## Decision: BullMQ on Redis is the message queue between recorders and the analyzer

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Warning

**Files**:
- `phase-2/phase2_architecture_plan.md.resolved`

**Rules**:
```json
{
  "conditions": [
    {
      "type": "file",
      "pattern": "phase-2/phase2_architecture_plan.md.resolved",
      "content_rules": [
        {
          "mode": "regex",
          "start": 0,
          "pattern": "(?i)(?!(.*BullMQ.*Redis.*))"
        }
      ],
      "content_match_mode": "all"
    }
  ],
  "match_mode": "all"
}
```

### Context

**Decision:** Core Intelligence uses a Message Queue implemented with BullMQ backed by Redis to buffer work between the Recorders and the LLM-powered Analyzer Service.

---

<!-- DECISION-81E99341 -->
## Decision: Decision Store is Postgres with embeddings

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Warning

**Files**:
- `phase-2/phase2_architecture_plan.md.resolved`

**Rules**:
```json
{
  "conditions": [
    {
      "type": "file",
      "pattern": "phase-2/phase2_architecture_plan.md.resolved",
      "content_rules": [
        {
          "mode": "string",
          "patterns": [
            "Postgres",
            "embeddings"
          ]
        }
      ]
    }
  ],
  "match_mode": "all"
}
```

### Context

**Decision:** Structured decision records are persisted in the Decision Store, which is Postgres augmented with vector embeddings (for semantic retrieval over decisions).

---

<!-- DECISION-8F17E97D -->
## Decision: Increase MCP session inactivity window from 30 to 45 minutes

**Status**: Active  
**Date**: 2026-05-25  
**Severity**: Warning

**Files**:
- `redis_ttl_config`
- `mcp_logs_session_logic`

**Rules**:
```json
{
  "conditions": [
    {
      "type": "file",
      "pattern": "*(redis_ttl_config|mcp_logs_session_logic)*",
      "content_rules": [
        {
          "mode": "regex",
          "start": 0,
          "pattern": "(30|0\\.5)\\s*(minutes|m)"
        }
      ],
      "content_match_mode": "any"
    }
  ],
  "match_mode": "all"
}
```

### Context

**Decision:** Update the MCP session inactivity window definition from 30 minutes to 45 minutes across the Redis TTL and mcp_logs session gap logic.

---

<!-- DECISION-7E82C9E0 -->
## Decision: Notification Service uses the Strategy Pattern for pluggable channels

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Warning

**Files**:
- `phase-2/phase2_architecture_plan.md.resolved`

**Rules**:
```json
{
  "conditions": [
    {
      "type": "file",
      "pattern": "phase-2/phase2_architecture_plan.md.resolved",
      "content_rules": [
        {
          "mode": "string",
          "patterns": [
            "Notification",
            "Strategy",
            "channel"
          ]
        }
      ]
    }
  ],
  "match_mode": "all"
}
```

### Context

**Decision:** The Notification Engine is built on the Strategy Pattern, with each delivery channel (Email, Slack DM, In-App/Push) implemented as an interchangeable strategy behind a common interface.

---

<!-- DECISION-EA70B4E7 -->
## Decision: Phase 1 vs Phase 2 split: read-side enforcement vs write-side capture (both enforce)

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Warning

**Files**:
- `phase-2/CLAUDE.md`
- `phase-2/ARCHITECTURE.md`

**Rules**:
```json
{
  "conditions": [
    {
      "type": "file",
      "pattern": "phase-2/+(CLAUDE.md|ARCHITECTURE.md)",
      "content_rules": [
        {
          "mode": "regex",
          "pattern": "Phase 2 is (non-enforcing|capture-only|passive)",
          "patterns": [
            "Phase 2 is non-enforcing",
            "Phase 2 is capture-only"
          ]
        }
      ]
    }
  ],
  "match_mode": "all"
}
```

### Context

**Decision:** Phase 1 (Decision Guardian) is the read side: a GitHub Action + CLI that reads committed `.decispher/decisions.md` / `context-rules.json` and blocks PRs. Phase 2 is the write side + management layer: it auto-generates those same files Phase 1 reads, AND runs its own enforcement surfaces — the Human Blocker (Slack/PR warnings), AI Blocker (IDE/git-hook rule files), and the MCP `check_intent` tool that returns BLOCKED/WARN/CLEAR to coding agents before code is written. So enforcement is NOT exclusive to Phase 1; Phase 2 both produces the records and actively gates against them at the agent/IDE layer.

---

<!-- DECISION-2BF01A8A -->
## Decision: Phase 2 is a pnpm + Turborepo monorepo

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Warning

**Files**:
- `phase-2/pnpm-workspace.yaml`
- `phase-2/turbo.json`
- `phase-2/tsconfig.base.json`
- `phase-2/packages`

**Rules**:
```json
{
  "conditions": [
    {
      "type": "file",
      "pattern": "phase-2/**/*",
      "content_rules": [
        {
          "mode": "full_file"
        }
      ]
    }
  ],
  "match_mode": "all"
}
```

### Context

**Decision:** The phase-2 codebase is a TypeScript monorepo managed with pnpm workspaces (pnpm-workspace.yaml, .npmrc) and Turborepo (turbo.json, .turbo/ cache), with shared TS config (tsconfig.base.json) and all services/libraries living under packages/.

---

<!-- DECISION-2215FC46 -->
## Decision: Realtime presence/typing events broadcast over Redis Pub/Sub, never stored in Postgres

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Warning

**Files**:
- `src/realtime/presence.ts`
- `src/realtime/pubsub.ts`

### Context

**Decision:** Ephemeral realtime signals (presence, cursor position, typing indicators) are fanned out across server instances exclusively via Redis Pub/Sub and are never written to Postgres. Only durable document state and the CRDT oplog are persisted.

---

<!-- DECISION-6E1CDF57 -->
## Decision: Two ingestion recorders: Slack Recorder Bot and Code Change Recorder

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Warning

**Files**:
- `phase-2/phase2_architecture_plan.md.resolved`

**Rules**:
```json
{
  "conditions": [
    {
      "type": "file",
      "pattern": "phase-2/phase2_architecture_plan.md.resolved",
      "content_rules": [
        {
          "mode": "string",
          "patterns": [
            "Slack Recorder Bot",
            "Code Change Recorder"
          ]
        }
      ]
    }
  ],
  "match_mode": "all"
}
```

### Context

**Decision:** Phase 2 ships two distinct Recorders as its data-ingestion edge: a Slack Recorder Bot (captures Slack conversations) and a Code Change Recorder (captures agent PRs and commits). Both normalize their source into queue messages for the Analyzer.

---

<!-- DECISION-ACA24657 -->
## Decision: Production deployment via Docker Compose; Paddle for billing

**Status**: Active  
**Date**: 2026-05-29  
**Severity**: Info

**Files**:
- `phase-2/docker-compose.prod.yml`
- `phase-2/infrastructure`
- `phase-2/PADDLE_SETUP.md`
- `phase-2/.env.paddle.example`
- `phase-2/.github/workflows/eval-fusion.yml`

**Rules**:
```json
{
  "conditions": [
    {
      "type": "file",
      "pattern": "phase-2/**/*",
      "content_rules": [
        {
          "mode": "full_file"
        }
      ]
    }
  ],
  "match_mode": "all"
}
```

### Context

**Decision:** Phase 2 is deployed as containers orchestrated by docker-compose.prod.yml (with an infrastructure/ directory and CI in .github/workflows/eval-fusion.yml), and integrates Paddle as the billing/payments provider (PADDLE_SETUP.md, .env.paddle.example).
