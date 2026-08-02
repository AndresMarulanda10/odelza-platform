# Odelza Cross-Workspace Bridge

The cross-workspace bridge publishes an explicitly selected collaboration
projection between otherwise isolated Odelza workspaces. It is not a general
replication system: workspace membership, unrelated records, secrets, and
private content never cross the boundary. The implementation contract is
tracked by [issue #1](https://github.com/AndresMarulanda10/odelza-platform/issues/1).

## Purpose And Trust Boundaries

- A source workspace owns the commercial and project context. A destination
  workspace receives only records approved for collaboration.
- Each Twenty workspace, the bridge Worker, Cloudflare Queue and D1, and file
  transfer endpoints are separate trust boundaries.
- The bridge trusts neither webhook payloads nor record identifiers until the
  request is authenticated, validated, and resolved through its mapping store.
- Destination users never receive source workspace membership or broad API
  access. Source users do not gain destination workspace access.
- The bridge stores routing, mapping, revision, and idempotency metadata only;
  it is not a second system of record for business content or file bodies.

## Data Ownership

| Data         | Ownership and synchronization                                                                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Company      | Source-authoritative. The destination receives the minimum projected identity needed to understand an assignment. Destination edits do not flow back.                              |
| Project      | Source-authoritative. Only approved projects are projected, and destination edits do not change source project context.                                                            |
| Task         | `title`, `status`, `dueAt`, and `progress` are managed bidirectionally at field level after publication. All other fields remain workspace-local unless this contract is extended. |
| Notes        | Private by default. A note crosses the boundary only through an explicit share action and retains its source attribution and mapping.                                              |
| Shared Files | Private by default. Only files explicitly included in `sharedFiles` are streamed to an approved destination. Folder contents and later uploads are not inferred.                   |

Company and Project projections provide context; they do not transfer ownership.
Removing a collaboration destination stops future publication but does not
delete records in either workspace.

## Collaboration Contract

| Field                       | Contract                                                                                                                                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `collaborationDestinations` | Source-managed allowlist of logical destination keys. An empty value means no cross-workspace publication. Unknown or disabled keys fail closed.                                                                                                          |
| `publicationStatus`         | Bridge-managed status per destination: `pending`, `published`, `blocked`, or `withdrawn`, with the last accepted revision and sanitized failure reason. It is operational state, not user authorization.                                                  |
| `externalAssignee`          | Portable logical assignee reference resolved through D1 to a destination user. It contains no API credential and must not expose a private email or workspace identifier. An unresolved reference blocks assignment without blocking the task projection. |
| `sharedFiles`               | Explicit set of source file references approved for transfer. Removal prevents future transfer; it never deletes an already delivered file.                                                                                                               |

Publication requires both a valid `collaborationDestinations` entry and a
current mapping for that destination. Notes and files require their own explicit
share signal even when their parent task is published.

## Runtime Architecture

1. A Worker ingress endpoint accepts Twenty webhook events for one configured
   workspace route.
2. Cloudflare Access validates a service token at the edge. The Worker then
   verifies a workspace-specific HMAC over the canonical
   `timestamp:nonce:rawBody` bytes before parsing the event. Twenty serializes
   the event once and sends those exact signed bytes.
3. The Worker validates the event envelope and enqueues normalized metadata. It
   does not perform cross-workspace writes on the request path.
4. A Cloudflare Queue consumer resolves object mappings and idempotency state in
   D1, reads the minimum required source fields, and applies the projection with
   the destination's scoped Twenty client.
5. Retryable failures use bounded Queue retries. Exhausted, invalid, or
   conflicting events enter a DLQ with sanitized diagnostics for explicit
   inspection and replay.

D1 records logical workspace keys, source and destination object mappings,
webhook delivery identifiers, bridge mutation identifiers, accepted field
revisions, and file digests. Unique constraints make delivery replay safe;
updates and idempotency receipts are committed atomically before an event is
acknowledged.

Files are downloaded and uploaded as streams. The Worker enforces configured
size and media-type limits, records a digest and transfer receipt, and never
buffers complete files or persists file bodies in D1, logs, Queue messages, or
Worker memory.

## Security Controls

- Cloudflare Access service-token credentials authenticate machine ingress.
  They are independent from HMAC secrets and Twenty API keys.
- Twenty attaches Access credentials only when the normalized webhook target is
  exactly `CROSS_WORKSPACE_BRIDGE_WEBHOOK_URL`. Host, path, suffix, or query
  near-matches receive no credentials. Ordinary webhooks keep the legacy
  `timestamp:rawBody` signature.
- Bridge deliveries require HTTPS and reject redirects; ordinary webhooks retain legacy redirect handling.
- Bridge URL, Access client ID, and Access client secret are dedicated
  environment-only server settings. A partial configuration fails closed.
- Each workspace has a separate HMAC secret and a separate least-privilege
  Twenty API key. A key can read or write only the objects and fields required
  for its direction of synchronization.
- Secrets are Worker bindings, never payload fields, D1 values, logs, or source
  files. Rotation can be performed per workspace without granting cross-tenant
  access.
- Logs contain logical destination keys, event identifiers, outcomes, and
  sanitized errors. They exclude note bodies, file bodies, API keys, HMACs,
  private emails, and raw workspace or record identifiers.

## Loops, Conflicts, And Deletes

Every bridge write carries a mutation identifier recorded in D1. Webhooks that
echo a known bridge mutation are acknowledged without republishing, preventing
feedback loops.

Company and Project always resolve to the source value. Independently changed
Task fields merge, but concurrent edits to the same managed field are not
silently overwritten: the stale event is marked `blocked` and sent for explicit
review or replay. Notes and files are append-only deliveries under this
contract; repeated deliveries are deduplicated by mapping and content digest.

The bridge never propagates automatic deletes. Withdrawal disables future
synchronization and marks `publicationStatus` as `withdrawn`; existing records,
notes, and files remain available for deliberate workspace-local retention or
manual removal.

## Initial Pilot

The pilot uses one source team workspace, one destination collaborator
workspace, one approved project, and a small set of selected tasks. Test data
and operator evidence use synthetic identities and logical keys only. Private
names, emails, production URLs, workspace IDs, record IDs, and credentials must
not appear in fixtures, documentation, commits, logs, or review artifacts.

The pilot proves selective publication and rollback. It does not authorize
additional destinations or broader field synchronization.

## Chained Delivery

The tracker branch integrates seven chained slices. Each child stays below 400
authored changed lines, targets its immediate predecessor, and includes its own
focused verification evidence.

| Slice                               | Review boundary                                                                             | Verification boundary                                                                                       | Rollback boundary                                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1. Contract and package shell       | This contract, package ownership, typed event and field schemas, and test harness           | Schema fixtures reject unknown destinations, fields, and identifiers                                        | Remove the package shell and this document; no runtime resources exist                                              |
| 2. Sender hardening                 | Exact bridge targeting, canonical raw-body HMAC, and Access service-token headers           | Exact target receives nonce-bound HMAC and Access headers; near-matches and partial config fail closed       | Remove dedicated settings and sender branch; ordinary webhook behavior remains unchanged                            |
| 3. Authenticated ingress            | Worker route, Access assumptions, raw-body HMAC validation, and Queue producer              | Valid signature enqueues once; stale, malformed, or unsigned requests fail closed                           | Remove ingress route and bindings; no consumer writes exist                                                         |
| 4. Durable delivery state           | Queue consumer, DLQ policy, D1 schema, mappings, and idempotency transaction                | Duplicate and retried events produce one receipt and one mapped operation                                   | Stop the consumer and roll back its isolated D1 migration; ingress can be disabled independently                    |
| 5. Source projection                | Source-authoritative Company and Project context plus initial Task publication              | Allowlisted tasks publish minimal fields; unselected records and destination context edits do not flow back | Disable the destination mapping and consumer; destination records are retained                                      |
| 6. Managed collaboration            | Bidirectional Task fields, explicit Notes, loop suppression, and conflict blocking          | Opposite-direction edits converge by field; echoed mutations deduplicate; same-field conflicts block        | Disable reverse routes and note sharing while retaining one-way source projection                                   |
| 7. Shared files and pilot hardening | Streamed `sharedFiles`, least-privilege checks, observability, runbook, and sanitized pilot | File limits, digest deduplication, DLQ replay, credential rotation, and pilot rollback are exercised        | Disable file transfer and pilot destination, revoke scoped credentials, and retain delivered data for manual review |

No slice may require production data to verify. A slice is not ready to chain
until its tests pass, `git diff --check` is clean, its diff contains only that
work unit, and its rollback leaves earlier slices operational.

## Out Of Scope

- General-purpose workspace replication or workspace membership federation.
- Automatic destructive propagation or destination record cleanup.
- Implicit sharing of notes, attachments, folders, or newly related records.
- Publication to client workspaces. Future client publication requires a
  separate threat model, authorization contract, issue, and delivery chain.
