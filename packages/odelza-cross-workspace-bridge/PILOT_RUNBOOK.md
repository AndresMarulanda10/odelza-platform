# Bridge Pilot Runbook
## Rollout
1. Staging first: dry-run, migrations, required secret presence, HTTPS adapter URL, and exact scopes.
2. Send one signed event; verify projection, sanitized `operation/status/service` logs, and no private fields.
3. Promote only after replay, rotation, and rollback checks; production remains explicit.

## Recovery
- Bounded terminal failures enter D1; operator replay reuses delivery/mutation IDs.
- Media, size, digest, authority, and conflict blocks never auto-share or mutate.
- Rotate after a differing least-privilege staging probe; never log or commit values.
- Roll back the last known-good Worker/configuration and pause replay until staging passes.
