# Global signup E2E recovery

- Base: actual main `b05590e7bde4b8d14be461e13cd10af539116495`.
- Scope: navigate onboarding signup to the client-config global origin and assert that scope before submitting. Preserve all onboarding assertions and authorization behavior.
- Modes: TDD off; RDD off.
- Acceptance: formatting/static checks and an isolated ACT E2E execution with runtime evidence. ACT must pass before any push; publication remains a parent-session gate.
- Safety: no deployment, secrets, host-runner execution, existing database reuse, or changes to the original checkout/preview. Temporary ACT adaptations must be disclosed.
- Rollback: remove only the onboarding test change and this recovery record.
- Progress: isolated standalone checkout created; implementation and ACT verification pending.
