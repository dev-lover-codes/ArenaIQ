# Security Posture

## Known Dependency Advisories
`npm audit` reports advisories in `next@14.2.35` (the latest patch release on the 14.x line) that are only resolved in Next.js 16.x, a major version with breaking changes to App Router internals, middleware, and edge runtime behavior.

**Decision:** We are staying on `next@14.2.35` (fully patched within the 14.x line) rather than upgrading to 16.x pre-submission, because:
1. A major-version jump this close to deadline risks breaking working Supabase SSR auth, middleware CSP nonce generation, and realtime subscriptions with no time buffer to re-verify
2. This is a stadium operations demo app with no real production user data at risk — the CVEs are primarily DoS/cache-poisoning vectors relevant at internet scale, not to a judged hackathon deployment
3. All non-breaking patches (14.2.29 → 14.2.35) have been applied

**Post-hackathon plan:** Upgrade to Next.js 16.x in a dedicated PR with full regression testing of auth, middleware, and realtime flows before merging.

## Mitigations Already In Place
- CSP with per-request nonces (script-src 'nonce-{random}' 'strict-dynamic')
- Strict-Transport-Security with preload
- Row-Level Security on every Supabase table
- Rate limiting with automatic expired-entry eviction
- Zero client-exposed API keys (Gemini calls are server-only)
