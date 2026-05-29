# c/decispher-official-mpkarwbs/architecture — phase-2 architecture

architeture decided for phase 2 decispher

8 context units. Full bodies served via `get_context_for_topic({ topic: "c/decispher-official-mpkarwbs/architecture" })`.

## Units in this topic

- **Document edits use server-authoritative CRDT merge, not last-write-wins** (id: e4ae823c-0eb5-4a48-9cf7-3ef20559deb5) · decision · HIGH
- **Phase 2 is the Decision Capture Engine (capture & intelligence layer)** (id: 4ddf24a6-8c7a-438e-abb6-dbaeeaef1e4e) · decision · HIGH
- **Phase 2 pipeline: Sources → Recorders → Core Intelligence → Notifications → Dashboard** (id: b0a3128b-6658-4409-80b4-a5b2e0703890) · decision · HIGH
- **An LLM-powered Analyzer Service turns raw activity into structured decisions** (id: c516730e-6c60-4ff2-a1f2-b92ae0f16bab) · decision · MEDIUM
- **BullMQ on Redis is the message queue between recorders and the analyzer** (id: 430932a3-f225-48ae-8791-b24632005528) · decision · MEDIUM
- **Decision Store is Postgres with embeddings** (id: 81e99341-c4d5-405e-bea4-a4873d20d406) · decision · MEDIUM
- **Notification Service uses the Strategy Pattern for pluggable channels** (id: 7e82c9e0-e875-4e42-82ee-b04ecd795fa2) · convention · MEDIUM
- **Two ingestion recorders: Slack Recorder Bot and Code Change Recorder** (id: 6e1cdf57-adc7-41fe-9a1b-02cdeeb2bd2d) · decision · MEDIUM

For the full body of any unit: `get_decision({ decisionId: "<id>" })`.

For the curated topic context bundle: `get_context_for_topic({ topic: "c/decispher-official-mpkarwbs/architecture" })`.
