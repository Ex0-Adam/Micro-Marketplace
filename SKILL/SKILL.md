---
name: micro-marketplace
description: Operate the Micro-Marketplace project (THOTH's module/template/theme catalogue) — run and verify it (npm ci / prisma generate / tsc / build / test / lint), understand its architecture and DB models, follow its security rules (guardApiSession, PUBLIC_PRODUCT_SELECT whitelist, isPublished filtering, upload limits), and wire it to a THOTH instance via marketplaceUrl. Use when asked to work on the Micro-Marketplace repo, its admin console, its public catalogue, product/category/media CRUD, its tests, or the THOTH↔marketplace integration.
---

# Micro-Marketplace — Operating Skill

Micro-Marketplace is THOTH's independent catalogue for selling **modules**, **templates**, and **themes**. It is a separate repo, database, and deployment — never import THOTH runtime code into it, and never let THOTH import this app's code. They communicate by URL only.

## When to use

- Running, building, testing, or debugging the Micro-Marketplace app
- Adding/changing products, categories, media, or site config (public catalogue or admin console)
- Touching the API route policy or session/auth code
- Wiring a THOTH instance to the marketplace (`marketplaceUrl`)
- Working the THOTH module-install / template features that consume this catalogue

## Non-negotiable rules

1. **DB-touching pages and routes must be dynamic.**
   ```ts
   export const dynamic = 'force-dynamic';
   ```
   `POSTGRES_PRISMA_URL` may be absent at build time; without this, the build tries to query at build time and fails.

2. **`params` and `searchParams` are Promises (Next.js 16).** Always `await` them.

3. **`route.ts` files must only export HTTP handlers (`GET`/`POST`/`PATCH`/`DELETE`), `dynamic`, and other route config.** Any helper/type goes in `lib/*` (this is why `lib/product-nested.ts` exists). Exporting a helper from a route breaks the build.

4. **Every write endpoint is guarded with `guardApiSession()`** (from `lib/security/api-policy.ts`). Only `auth/login`, `auth/logout`, `auth/setup` are exempt (enforced by `tests/route-policy.test.mjs`). `/api/admin/*` must be guarded even for `GET`.

5. **Public reads filter drafts and use the whitelist.**
   - Always `isPublished: true`
   - Always select through `PUBLIC_PRODUCT_SELECT` (`lib/product-data.ts`) — never `include: true` on a public route
   - Changing the field list requires updating `AGENTS.md` and `tests/route-policy.test.mjs` together

6. **Session cookie is never a raw user id** — it is an HMAC-signed token via `lib/security/session.ts`, keyed by `SESSION_SECRET` (throws if missing — fail closed).

7. **Uploads:** `app/api/upload/route.ts` guards the session, caps size at `MAX_UPLOAD_BYTES` (8 MB), and restricts `ALLOWED_MIME` (png/jpeg/webp/gif/svg).

8. **CORS is an explicit allowlist** (`ALLOWED_ORIGINS`, exact origins, comma-separated, no wildcard) handled in `proxy.ts`.

9. No Python in this repo (family rule #6). No push unless ฌัง explicitly orders it (family rule #5 — ฌอน has push restrictions).

## Commands

```bash
npm ci                 # deps (package-lock.json is committed; npm 12 blocks install-scripts)
npx prisma generate    # must run manually after npm ci/install
npm run dev            # http://localhost:3000 (PORT=3100 npm run dev if 3000 is taken)
npm run build          # next build
npm run lint           # eslint
npm test               # node --test tests/*.test.mjs
npx tsc --noEmit       # typecheck (must exit 0)
npx prisma db push     # sync schema (no /migrations — db push only)
npx prisma studio
```

The Prisma datasource reads `POSTGRES_PRISMA_URL` (runtime) and `directUrl POSTGRES_URL_NON_POOLING` (`db push`/migrations) — not `DATABASE_URL`. On Vercel + Supabase integration both are injected automatically. `SESSION_SECRET` is required for auth.

Always finish with: `npx tsc --noEmit` → `npm run build` → `npm test` → `npm run lint` (Write → Verify → Report).

## Architecture at a glance

- `prisma/schema.prisma` — `User`, `Category`, `Product`, `ProductVersion`, `Screenshot`, `Media`, `SiteConfig`
  - `Product.kind` = `module | template | theme`; `tags String[]`; `isPublished` gate
  - `SiteConfig` is a singleton with id `"singleton"` (use `upsert`)
- `lib/product-data.ts` — `PRODUCT_KINDS`, `PUBLIC_PRODUCT_SELECT`, `ProductFilters` (supports `kind`, `kinds[]`, `category`, `q`, `featured`), `slugify`, public + admin queries
- `lib/product-input.ts` — `parseProductInput(body, { partial })` validates admin payloads
- `lib/product-nested.ts` — `normalizeScreenshots` / `normalizeVersions`
- Public API: `GET /api/products`, `GET /api/products/[slug]`, `GET /api/categories`
- Auth API: `POST /api/auth/{login,logout,change-password}`, `GET|POST /api/auth/setup`
- Admin API: `/api/admin/{products,categories,site-config,media}` (+ `[id]`)
- Admin UI: overview, products, categories, media library, site config, bootstrap status, change password
- Public pages: `/`, `/modules`, `/templates`, `/search`, `/[slug]`

## THOTH ↔ Marketplace integration

- Marketplace stores **metadata + links only**. The ZIP lives in the product's own repo; link it via `repoUrl` / `releaseUrl` (or per-version `releaseUrl`).
- THOTH reads the catalogue through `NEXT_PUBLIC_MARKETPLACE_URL`, with `SiteConfig.marketplaceUrl` overriding it in admin.
- CORS: add each THOTH origin to `ALLOWED_ORIGINS` on the marketplace.
- THOTH-side module install (cross-platform) is handled in `THOTH/lib/extensions/registry.ts` — that guard against non-Windows platforms is a known blocker (P3 of the plan).

## Deployment order (do not reorder)

1. Build + verify marketplace locally
2. Apply schema (`prisma db push`) to the marketplace DB
3. Create the first admin via `/setup`
4. Deploy marketplace → obtain URL
5. Only then add the URL to THOTH

## References

- `AGENTS.md` — project rules, business policy, Next.js 16 specifics
- `HANDOFF.md` — current work state and next move
- `../THOTH/docs/MODULE_STANDARD.md`, `../THOTH/docs/UPDATE_PLAN_2026-10.md` — THOTH-side context
