import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Presentation layer must not import Prisma directly (HTTP boundary app/api and
// data-access lib/* are exempt).
const prismaImportGuard = {
  files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
  ignores: ["app/api/**"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@/lib/prisma",
            message:
              "Presentation code must not import Prisma directly. Use a lib service (e.g. lib/*-data) or the HTTP API. HTTP boundary (app/api) is exempt.",
          },
        ],
        patterns: [
          {
            group: ["**/lib/prisma"],
            message:
              "Presentation code must not import Prisma directly. Use a lib service (e.g. lib/*-data) or the HTTP API. HTTP boundary (app/api) is exempt.",
          },
        ],
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prismaImportGuard,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
