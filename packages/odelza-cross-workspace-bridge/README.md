# Odelza Cross-Workspace Bridge

Standalone Cloudflare Worker ingress for selective cross-workspace synchronization.
This slice authenticates and validates webhook metadata, then records Queue
deliveries durably for a later projection slice.

## Local behavior

- `GET /health` returns the service status without configuration or secrets.
- `POST /webhooks/twenty` authenticates and validates JSON webhook metadata,
  returning `202` only after Queue accepts normalized metadata.
- Every other route returns `404`.
- The Queue consumer records one delivery receipt and one pending normalized
  event transactionally in D1. Duplicate deliveries are acknowledged without
  repeating the write. It performs no destination writes or external calls.

Wrangler runs D1 and Queue bindings locally by default. The top-level resource
names are local-only conventions; do not deploy the top-level environment.

## Cloudflare resources

Staging and production bindings are declared separately because Wrangler does
not inherit bindings into named environments. Wrangler 4.115 supports automatic
provisioning for D1 and Queues, so no account-specific resource IDs are stored in
this package. The first authorized remote deployment will provision resources
and may write their IDs back to `wrangler.jsonc`.

Remote deployment, resource creation, migration application, and secret
provisioning are intentionally outside this slice.
If automatic provisioning is unavailable in the target account, obtain the D1
IDs with an authorized operator workflow and add `database_id` to each named
environment immediately before deployment. Package dependencies use the newest
releases admitted by the repository's three-day package quarantine.
Tests use the newest compatibility date supported by that admitted local
`workerd` build; deployed environments retain the current `2026-08-01` date.

## Commands

Run through Nx from the repository root:

```sh
yarn nx run odelza-cross-workspace-bridge:format
yarn nx run odelza-cross-workspace-bridge:lint
yarn nx run odelza-cross-workspace-bridge:typecheck
yarn nx run odelza-cross-workspace-bridge:test
yarn nx run odelza-cross-workspace-bridge:wrangler-types
yarn nx run odelza-cross-workspace-bridge:deploy-dry-run --configuration=staging
yarn nx run odelza-cross-workspace-bridge:startup-check
```

Deploy only through an explicitly authorized workflow using `--env staging` or
`--env production`. Never deploy the top-level local environment.
