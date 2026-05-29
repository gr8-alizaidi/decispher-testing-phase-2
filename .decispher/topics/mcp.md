# mcp — MCP (Model Context Protocol)

Decispher's Live Context surface — tools agents call to fetch decisions, topics, intents, and constraints.

3 context units. Full bodies served via `get_context_for_topic({ topic: "mcp" })`.

## Spine (always applies)

### Strict Prohibition on Storing Raw Payment Card Numbers
Severity: CRITICAL · Status: active · Type: constraint

The system must not store raw card numbers (PAN). All payment processing must occur via Stripe tokenization, storing only the Stripe token and the last four digits of the card.

## Units in this topic

- **Establish naming convention for database columns and API JSON fields** (id: 26c9c1c0-343b-4f5a-90e1-afe1a8971e43) · decision · HIGH
- **Increase MCP session inactivity window from 30 to 45 minutes** (id: 8f17e97d-1c8e-4b9e-98dd-35802d1200ad) · decision · MEDIUM

For the full body of any unit: `get_decision({ decisionId: "<id>" })`.

For the curated topic context bundle: `get_context_for_topic({ topic: "mcp" })`.
