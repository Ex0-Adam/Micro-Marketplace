import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API_DIR = path.join(ROOT, "app", "api");

const PUBLIC_WRITE = new Set([
  "auth/login/route.ts",
  "auth/logout/route.ts",
  "auth/setup/route.ts",
]);

const AUTH_PROOF = ["guardApiSession", "getCurrentUser", "requireAuth"];
const WRITE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry === "route.ts") out.push(full);
  }
  return out;
}

function exportedMethods(source) {
  const methods = [];
  const re = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g;
  let m;
  while ((m = re.exec(source)) !== null) methods.push(m[1]);
  return methods;
}

const routeFiles = walk(API_DIR);

test("app/api has route files to audit", () => {
  assert.ok(routeFiles.length >= 15, `expected >=15 route files, got ${routeFiles.length}`);
});

test("every write endpoint is session-guarded (public auth allowlist only)", () => {
  const violations = [];
  for (const file of routeFiles) {
    const rel = path.relative(API_DIR, file);
    const source = readFileSync(file, "utf8");
    const hasProof = AUTH_PROOF.some((p) => source.includes(p));
    for (const method of exportedMethods(source)) {
      if (!WRITE.has(method)) continue;
      if (PUBLIC_WRITE.has(rel)) {
        if (rel === "auth/setup/route.ts" && !source.includes("needsSetup")) {
          violations.push(`${rel} POST: setup must check needsSetup`);
        }
        continue;
      }
      if (!hasProof) violations.push(`${rel} ${method}: no auth proof`);
    }
  }
  assert.deepEqual(violations, []);
});

test("initial admin setup requires an operator key and creates the first user atomically", () => {
  const setupSrc = readFileSync(path.join(API_DIR, "auth", "setup", "route.ts"), "utf8");
  assert.ok(setupSrc.includes("INITIAL_ADMIN_SETUP_TOKEN"), "setup must require an operator-configured key");
  assert.ok(setupSrc.includes("timingSafeEqual"), "setup key comparison must be timing-safe");
  assert.ok(
    setupSrc.includes("Prisma.TransactionIsolationLevel.Serializable"),
    "first admin creation must use serializable isolation"
  );
  assert.ok(setupSrc.includes('error.code === "P2034"'), "concurrent setup conflicts must be rejected");
});

test("every /api/admin endpoint is guarded (including GET)", () => {
  const violations = [];
  for (const file of routeFiles) {
    const rel = path.relative(API_DIR, file);
    if (!rel.startsWith("admin" + path.sep)) continue;
    const source = readFileSync(file, "utf8");
    const methods = exportedMethods(source);
    if (methods.length === 0) violations.push(`${rel}: no exported handlers`);
    if (!AUTH_PROOF.some((p) => source.includes(p))) {
      violations.push(`${rel}: no auth proof`);
    }
  }
  assert.deepEqual(violations, []);
});

test("session cookie is never set to a raw user id", () => {
  const violations = [];
  for (const file of routeFiles) {
    const source = readFileSync(file, "utf8");
    if (/set\(\s*['"]session['"]\s*,\s*user\.id/.test(source)) {
      violations.push(path.relative(ROOT, file));
    }
  }
  assert.deepEqual(violations, []);
});

test("public product reads always filter unpublished listings", () => {
  const dataSrc = readFileSync(path.join(ROOT, "lib", "product-data.ts"), "utf8");
  assert.ok(
    dataSrc.includes("isPublished: true"),
    "listPublicProducts must filter isPublished: true"
  );
  assert.ok(
    /getPublicProductBySlug[\s\S]*?isPublished:\s*true/.test(dataSrc),
    "getPublicProductBySlug must also require isPublished"
  );
});

test("PUBLIC_PRODUCT_SELECT is the disclosure boundary and matches the approved field set", () => {
  const APPROVED = [
    "slug", "name", "tagline", "description", "kind", "priceCents", "currency",
    "repoUrl", "releaseUrl", "demoUrl", "docsUrl", "coverImage",
    "authorName", "authorUrl", "license", "latestVersion", "minCmsVersion",
    "tags", "updatedAt", "category", "screenshots", "versions",
  ];

  const dataSrc = readFileSync(path.join(ROOT, "lib", "product-data.ts"), "utf8");
  const selectMatch = dataSrc.match(/PUBLIC_PRODUCT_SELECT\s*=\s*\{([\s\S]*?)\}\s*satisfies/);
  assert.ok(selectMatch, "PUBLIC_PRODUCT_SELECT must be declared in lib/product-data.ts");

  const keys = [...selectMatch[1].matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]).sort();
  assert.deepEqual(
    keys,
    [...APPROVED].sort(),
    "public product fields must match the approved list exactly; changing this requires updating AGENTS.md and this test together"
  );

  const listRoute = readFileSync(path.join(API_DIR, "products", "route.ts"), "utf8");
  assert.ok(listRoute.includes("listPublicProducts"), "GET /api/products must use the public projection");

  const detailRoute = readFileSync(path.join(API_DIR, "products", "[slug]", "route.ts"), "utf8");
  assert.ok(detailRoute.includes("getPublicProductBySlug"), "GET /api/products/[slug] must use the public projection");
});

test("catalogue Product keeps an explicit publish flag (unlike THOTH Project)", () => {
  const schema = readFileSync(path.join(ROOT, "prisma", "schema.prisma"), "utf8");
  const model = schema.match(/model Product \{([\s\S]*?)\n\}/);
  assert.ok(model, "Product model must exist in prisma/schema.prisma");
  assert.ok(
    /isPublished\s+Boolean/.test(model[1]),
    "Marketplace listings are gated by isPublished by design"
  );
});

test("storage upload validates mime type and size", () => {
  const uploadSrc = readFileSync(path.join(API_DIR, "upload", "route.ts"), "utf8");
  assert.ok(uploadSrc.includes("guardApiSession"), "upload must be session-guarded");
  assert.ok(uploadSrc.includes("MAX_UPLOAD_BYTES"), "upload must cap file size");
  assert.ok(uploadSrc.includes("ALLOWED_MIME"), "upload must restrict mime types");
});
