# HANDOFF.md — Micro-Marketplace

> เอกสารส่งต่อเซสชัน สำหรับ agent ตัวถัดไปทำงานต่อได้ทันที
> เขียน: **2026-10-09 โดย ฌอน (opencode)** · อ่านคู่กับ `AGENTS.md` และ `SKILL/SKILL.md`

---

## 1. เป้าหมาย (Objective)

สร้าง **Micro-Marketplace** = เว็บขายโมดูล/เทมเพลต/ธีม ของ THOTH เป็น repo/DB/deploy อิสระ แล้วให้ THOTH อ้างถึงด้วย URL เพื่อรองรับฟีเจอร์ติดตั้งโมดูล + template UI แบ่งเป็น 2 ส่วน (UI แอดมิน/โมดูลแอดมิน และ template UI for sale)

### มติล็อกแล้ว (พี่ฆัง)

- เฟสแรก = **Catalogue + ลิงก์อย่างเดียว** (ไม่มีบัญชีลูกค้า/ตะกร้า/payment) แต่ **มี DB + admin หลังบ้าน CRUD เต็ม**
- "Template UI for sale" รองรับ **ทั้ง** full frontend app (`apps/web`) **และ** theme/design pack — แยกด้วย `Product.kind`
- ไฟล์โมดูล/เทมเพลต (ZIP) เก็บใน **repo ของตัวเอง** — marketplace เก็บแค่ metadata + ลิงก์
- THOTH อ้าง marketplace ผ่าน **`NEXT_PUBLIC_MARKETPLACE_URL` + `SiteConfig.marketplaceUrl`**
- ใช้ THOTH เป็นเฟรมเวิร์กตั้งต้นแบบ **A. Copy core ครั้งเดียว** → คนละ repo/DB/deploy
- **ลำดับบังคับ:** สร้าง Marketplace → deploy → ได้ URL → ค่อยเพิ่ม URL เข้า THOTH

---

## 2. สถานะงาน (Work State)

### เสร็จแล้ว (P0 scaffold — เขียนไฟล์ลงดิสก์ทั้งหมด)

- **root/config:** `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vercel.json`, `.gitignore`, `.env.example`, `Dockerfile`, `proxy.ts`
- **prisma:** `schema.prisma` — `User`, `Category`, `Product`, `ProductVersion`, `Screenshot`, `Media`, `SiteConfig`; `Product.kind` = module|template|theme, `tags String[]`
- **lib:** `prisma.ts`, `auth.ts`, `security/{session,cors-policy,api-policy,secrets}.ts`, `storage/{types,index,local,s3}.ts`, `system/database-status.ts`, `product-data.ts`, `category-data.ts`, `site-config-data.ts`, `admin-dashboard-data.ts`, `product-input.ts`, `product-nested.ts`
- **components:** `marketplace/PublicHeader.tsx`, `marketplace/ProductCard.tsx`
- **public pages:** `app/page.tsx`, `modules`, `templates`, `search`, `[slug]` (ทุกไฟล์ `force-dynamic`)
- **auth pages:** `login`, `setup` + `SetupForm.tsx`
- **admin:** `admin/layout.tsx`, `admin/AdminSidebar.tsx`, `admin/page.tsx`, `admin/products`, `admin/categories`, `admin/media`, `admin/configuration`, `admin/database`, `admin/change-password`
- **API:** public (products, products/[slug], categories) · auth (login, logout, setup, change-password) · system/bootstrap · admin (products, products/[id], categories, categories/[id], site-config, media, media/[id]) · upload
- **tests:** `tests/route-policy.test.mjs`, `tests/session.test.mjs`
- **docs:** `AGENTS.md`, `HANDOFF.md`, `SKILL/SKILL.md`

### เสร็จแล้ว (P0 verify + P1 DB — ตรวจ 2026-10-09)

- **P0 verify ผ่านทุกด่าน:** `npx tsc --noEmit` → exit 0 · `npm run build` → exit 0 · `npm test` → 17/17 · `npm run lint` → exit 0
- **แก้ที่เจอตอน verify:** type predicate ใน `lib/product-nested.ts` (rewrite เป็น for-loop) + `react-hooks/set-state-in-effect` ใน 3 หน้า admin (`Promise.resolve().then(load)` ใน effect)
- **P1 ต่อ DB จริงเสร็จ:** ผูก Prisma → **Supabase** ผ่าน `POSTGRES_PRISMA_URL` (runtime) + `POSTGRES_URL_NON_POOLING` (`directUrl`, ใช้ตอน `db push`) แทน `DATABASE_URL`; `npx prisma db push` สำเร็จ **7 tables**; เพิ่ม `SESSION_SECRET` + `ALLOWED_ORIGINS` ใน `.env`
- **E2E smoke กับ DB จริงผ่าน:** `GET /setup` needsSetup=true → `POST /setup` สร้าง admin → `POST /login` → `GET /api/admin/*` ไม่มี cookie = **401** → create category/product → unpublished **ซ่อน** จาก public → publish แล้ว**โผล่** (field ตาม `PUBLIC_PRODUCT_SELECT`) → `GET /api/products/[slug]` = 200 — จากนั้น**ล้างข้อมูลทดสอบออกหมด** (users/categories/products = 0) และปิด dev server
- `public/uploads/` ถูก `.gitignore` และสร้าง runtime เอง — ไม่ต้อง commit

### ยังไม่ได้ทำ

- **ยังไม่ init git** ในโฟลเดอร์นี้ (ไม่มี commit)
- **ยังไม่ deploy** → ยังไม่มี marketplace URL (P2 ต้องรอ URL นี้)
- `npm audit` 11 ช่องโหว่ (high 10, critical 1) ยังไม่แก้
- **P2–P5** (THOTH integration, module install cross-platform, templates registry) ยังไม่เริ่ม

---

## 3. ก้าวต่อไป (Next Move)

1. **git init + commit แรก** ในโฟลเดอร์นี้ (แล้วแต่พี่ฆังสั่ง — ปกติฌอนไม่ commit เองจนกว่าจะสั่ง)
2. **Deploy marketplace** (Vercel) → ได้ URL
3. **P2** — เพิ่ม `marketplaceUrl` เข้า THOTH (`SiteConfig` + `NEXT_PUBLIC_MARKETPLACE_URL` + admin link + sidebar)
4. **P3** — THOTH module install cross-platform: แก้ `lib/extensions/registry.ts` (~บรรทัด 190 บล็อก `process.platform !== 'win32'`) + install-from-URL + loader + admin UI + อัปเดต `docs/MODULE_STANDARD.md`
5. **P4** — templates registry + `/admin/templates` + `apps/web` consume + `TEMPLATE_STANDARD`
6. **P5** — verify both repos + docs sync

> ตัวเลือกเสริม: แก้ `npm audit` (10 high / 1 critical) ก่อน deploy — แต่ยังไม่ได้ตัดสิน

---

## 4. ข้อควรระวัง (Gotchas)

- **Next 16:** `params`/`searchParams` เป็น Promise → `await` เสมอ
- **route.ts ห้าม export helper** — ย้ายไป `lib/product-nested.ts` แล้ว (build จะพังถ้าย้ายกลับ)
- ทุกหน้า/route ที่แตะ DB ต้อง `export const dynamic = 'force-dynamic'`
- **Prisma datasource ใช้ `POSTGRES_PRISMA_URL` + `directUrl POSTGRES_URL_NON_POOLING`** (ไม่ใช่ `DATABASE_URL`) — `lib/system/database-status.ts` เช็คทั้งสองชื่อ
- `SESSION_SECRET` ขาด → throw (fail closed) — ตั้งใน `.env` แล้ว
- `ALLOWED_ORIGINS` ต้องใส่ origin ของ THOTH (exact, ไม่มี wildcard) — ตอนนี้ว่าง (same-origin only)

---

## 5. ไฟล์อ้างอิงสำคัญ

| เรื่อง | ไฟล์ |
| --- | --- |
| Whitelist public | `lib/product-data.ts` (`PUBLIC_PRODUCT_SELECT`) |
| Validate payload | `lib/product-input.ts` |
| Helper normalize | `lib/product-nested.ts` |
| CRUD หลัก | `app/api/admin/products/route.ts`, `[id]/route.ts` |
| Bootstrap/needsSetup | `app/api/auth/setup/route.ts` |
| เมนู admin | `app/admin/AdminSidebar.tsx` |
| Policy tests | `tests/route-policy.test.mjs`, `tests/session.test.mjs` |
| THOTH ปลายทาง (P2–P4) | `../THOTH/lib/extensions/registry.ts`, `../THOTH/prisma/schema.prisma`, `../THOTH/docs/MODULE_STANDARD.md`, `../THOTH/app/admin/modules/page.tsx` |
