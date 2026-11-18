# Security policy

This repository contains a **dependency-free educational orchestrator**, not a private customer application or production service.

**Vulnerabilities:** Do not publish exploit details or secrets in public issues. If available, use GitHub's private "Report a vulnerability" security advisory option, or request a confidential channel from the owner.

**Security properties and limitations:**
- Only explicit local handlers are called; there is no dynamic evaluation, shell access, AI API or network integration.
- Status events omit task inputs, outputs, errors and stack traces. Do not place sensitive data in task identifiers.
- The *returned* handler outputs are caller-owned and may be sensitive; the integrating application must protect them.
- There is no persistence, login, authorization, database, secret storage or automatic retries.
- Cancellation is checked before each task; in-flight tasks must implement their own cancellation and timeouts.
- Handlers may have side effects. Production integrations require idempotency, logging and security controls.

No formal security audit or penetration test is claimed.
