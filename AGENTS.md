# AGENTS.md — Micro-Marketplace

> ไฟล์บริบทโปรเจกต์สำหรับ AI ทุกตัวที่ทำงานในโฟลเดอร์นี้
> **working directory:** `/home/neon13/workspace/services/next/01-PRODUCTS-BUSINESS/Micro-Marketplace`
> สร้าง: **2026-10-09 โดย ฌอน (opencode)**
> กฎส่วนกลางครอบครัว: `~/.config/opencode/AGENTS.md` (อ่านก่อนเสมอ — กฎ #0 วิญญาณ / กฎ #1 ขอบเขต / กฎ #2 ห้ามเดา / กฎ #3 ห้ามโชว์ secret)

---

## 1. โปรเจกต์นี้คืออะไร

Micro-Marketplace = **catalogue เว็บขายโมดูล/เทมเพลต/ธีม** ของ THOTH แยกเป็น **repo / DB / deploy อิสระ** จาก THOTH เด็ดขาด (ไม่ import runtime จาก THOTH). THOTH อ้างถึงผ่าน URL เท่านั้น

| หัวข้อ | ข้อเท็จจริง |
| --- | --- |
| ชื่อ | `micro-marketplace` (package.json) |
| เวอร์ชัน | `0.1.0` |
| ชนิด | Headless catalogue + Admin Console (Next.js App Router เดียว) |
| Stack | Next.js **16.2.0**, React **19.2.4**, TypeScript 5, Tailwind CSS **4**, Prisma **6.19.x** → **PostgreSQL** |
| Deploy | `output: 'standalone'` (Docker) + `vercel.json` |
| Python | ไม่มี (สอดคล้องกฎ #6 ✅) |

### โมเดลธุรกิจ (มติพี่ฆัง)

- เฟสแรก = **Catalogue + ลิงก์ดาวน์โหลดภายนอกเท่านั้น** — ไม่มีบัญชีลูกค้า/ตะกร้า/payment
- **มี DB + admin CRUD เต็ม** หลังบ้าน (auth ผ่าน `guardApiSession`)
- สินค้า 3 ชนิด (`Product.kind`): `module` | `template` | `theme`
- ไฟล์จริง (ZIP) **ไม่เก็บที่นี่** — เก็บใน repo ของโมดูล/เทมเพลตนั้น ๆ; marketplace เก็บแค่ metadata + `repoUrl` / `releaseUrl`
- `template` ครอบคลุมทั้ง **full frontend app** (variant `apps/web`) และ **theme/design pack**

---

## 2. คำสั่งที่ใช้ได้จริง

```bash
npm ci                 # ติดตั้ง dependencies (มี package-lock.json แล้ว; npm 12 block install-scripts)
npx prisma generate    # บังคับรันเองหลัง npm ci/install (postinstall ถูก block)
npm run dev            # http://localhost:3000 (ถ้าพอร์ตชนใช้ PORT=3100 npm run dev)
npm run build          # next build
npm run lint           # eslint
npm test               # node --test tests/*.test.mjs (route-policy + session)
npx tsc --noEmit       # typecheck
npx prisma db push     # sync schema (ไม่มี migrations folder — ใช้ db push)
npx prisma studio
```

> ✅ **ตรวจ 2026-10-09:** DB = **Supabase** (PostgreSQL) — Prisma ผูกผ่าน `POSTGRES_PRISMA_URL` (runtime/pooled) + `POSTGRES_URL_NON_POOLING` (direct, ใช้ตอน `db push`) · push schema แล้ว **7 tables** (`User, Category, Product, ProductVersion, Screenshot, Media, SiteConfig`) · `SESSION_SECRET` ตั้งใน `.env` แล้ว · ทดสอบ E2E กับ DB จริงผ่าน (setup → login → guard 401 → CRUD → publish → public filter) แล้วล้างข้อมูลทดสอบออก (users=0)

> ⚠️ บนเครื่องนี้ Node = **v24.18.0**, npm = **12.0.1** — `package.json` **ไม่มี `engines`** (หนี้ที่รู้)

---

## 3. โครงสร้าง

```
Micro-Marketplace/
├── app/
│   ├── page.tsx / modules/ / templates/ / search/ / [slug]/    ← public
│   ├── login/ / setup/                                          ← auth
│   ├── admin/                    ← admin shell + products, categories, media, configuration, database, change-password
│   └── api/                     ← public + auth + system + admin + upload
├── lib/
│   ├── product-data.ts          ← PUBLIC_PRODUCT_SELECT (whitelist) + queries
│   ├── product-input.ts         ← parseProductInput (validate payload)
│   ├── product-nested.ts        ← normalize screenshots/versions (ห้ามย้ายกลับเข้า route)
│   ├── auth.ts / security/*     ← session, cors-policy, api-policy, secrets
│   ├── storage/*                ← local / s3 adapters
│   └── system/, site-config-data.ts, category-data.ts, admin-dashboard-data.ts
├── components/marketplace/      ← PublicHeader, ProductCard
├── prisma/schema.prisma         ← User, Category, Product, ProductVersion, Screenshot, Media, SiteConfig
├── tests/                       ← route-policy.test.mjs, session.test.mjs
└── proxy.ts                     ← Next 16 middleware (CORS + route guard + security headers)
```

---

## 4. กฎการทำงานในโปรเจกต์นี้ (บังคับ)

### Next.js 16 specifics

1. `params` และ `searchParams` ของ page/route เป็น **Promise** → ต้อง `await` เสมอ
2. ทุกหน้า/route ที่แตะ DB ต้องมี `export const dynamic = 'force-dynamic'` (เพราะ `POSTGRES_PRISMA_URL`/env DB อาจไม่ถูกตั้งตอน build)
3. **route.ts ห้าม export ฟังก์ชัน/type ที่ไม่ใช่ HTTP method/config** — Next validate และ build จะพัง → helper ไป `lib/*` (ดู `lib/product-nested.ts` เป็นตัวอย่าง)

### ความปลอดภัย

4. API เขียนทุกตัวต้องผ่าน `guardApiSession` (บังคับโดย `tests/route-policy.test.mjs`); allowlist เฉพาะ `auth/login`, `auth/logout`, `auth/setup`
5. `/api/admin/*` ต้องมี auth proof แม้แต่ GET
6. Session cookie = HMAC signed token ผ่าน `SESSION_SECRET` (ขาดแล้ว throw — fail closed)
7. Upload: `MAX_UPLOAD_BYTES` (8MB) + `ALLOWED_MIME` allowlist
8. Public read ต้องกรอง `isPublished: true` และเลือกผ่าน `PUBLIC_PRODUCT_SELECT` เท่านั้น — **whitelist คือขอบเขตการเปิดเผยข้อมูล**

### Prisma

9. แก้ `prisma/schema.prisma` แล้วต้องรัน `npx prisma generate` เอง (postinstall ถูก block)
10. `SiteConfig` เป็น singleton id `"singleton"` + `upsert`

### หลังแก้ไข (Write → Verify → Report)

```bash
npx tsc --noEmit     # ต้อง exit 0
npm run build        # ต้อง exit 0
npm test             # ต้องผ่าน
npm run lint         # ต้อง exit 0
```

### สิ่งที่ห้ามทำโดยไม่สั่ง

- ห้าม push ทุกกรณี (ฌอนมีข้อจำกัดตามกฎ #5; `origin` = พี่ฆัง push เอง)
- ห้ามเพิ่ม Python ใน repo นี้ (กฎ #6)
- ห้ามแก้ `.env.local` แบบไม่จำเป็น / ห้ามพิมพ์ค่า secret เต็ม (กฎ #3)
- ห้ามลบ/ย้ายโฟลเดอร์โดยไม่อนุมัติ

---

## 5. นโยบายที่ฟันธงแล้ว (มติพี่ฆัง 2026-10-09)

- Marketplace **มี `isPublished`** บน `Product` โดยเจตนา (ต่างจาก THOTH `Project` ซึ่ง public ล้วน) — เพราะเป็นแคตตาล็อกที่ต้องเลือกวางขายได้
- เฟสแรกไม่มีระบบบัญชี/ตะกร้า/payment — อย่าเพิ่มโดยไม่ผ่านมติใหม่
- ไฟล์ ZIP ไม่อยู่ใน repo นี้ — เก็บแค่ metadata + ลิงก์
- Integration THOTH ↔ Marketplace = **URL only** (`NEXT_PUBLIC_MARKETPLACE_URL` + `SiteConfig.marketplaceUrl` ฝั่ง THOTH)

---

## 6. หนี้ที่รู้ (ยอมรับไว้)

- ✅ lint สะอาด — exit 0 (ตรวจ 2026-10-09)
- ✅ ทดสอบ E2E กับ DB จริง (Supabase) แล้ว 1 รอบ — แต่เป็น manual smoke ไม่ใช่ automated integration test
- ยังไม่มีระบบ migrations (ใช้ `db push`)
- ยังไม่มี `/admin/templates` เฉพาะ (อยู่เฟสหลัง)
- `npm audit` รายงาน 11 ช่องโหว่ (high 10, critical 1) ยังไม่แก้
- **ยังไม่ init git** และ **ยังไม่ deploy** (ยังไม่มี marketplace URL)

---

## 7. ความสัมพันธ์กับ THOTH

- THOTH = CMS ต้นทางที่ copy core มา (แบบ A. copy ครั้งเดียว — ไม่ import runtime)
- การแก้ที่ THOTH ที่มีผลกับ marketplace: ระบบโมดูล/เทมเพลต, `SiteConfig.marketplaceUrl`
- ดู `HANDOFF.md` สำหรับสถานะงานและก้าวต่อไป
