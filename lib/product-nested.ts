export type NestedScreenshot = {
  url: string;
  caption?: string | null;
  sortOrder?: number;
};

export type NestedVersion = {
  version: string;
  releaseUrl?: string | null;
  changelog?: string | null;
  minCmsVersion?: string | null;
};

export function normalizeScreenshots(value: unknown): NestedScreenshot[] {
  if (!Array.isArray(value)) return [];
  const out: NestedScreenshot[] = [];
  for (const item of value) {
    const raw = (item ?? {}) as Record<string, unknown>;
    const url = typeof raw.url === "string" ? raw.url.trim() : "";
    if (!url) continue;
    out.push({
      url,
      caption:
        typeof raw.caption === "string" && raw.caption.trim() ? raw.caption.trim() : null,
      sortOrder: typeof raw.sortOrder === "number" ? raw.sortOrder : out.length,
    });
  }
  return out;
}

export function normalizeVersions(value: unknown): NestedVersion[] {
  if (!Array.isArray(value)) return [];
  const out: NestedVersion[] = [];
  for (const item of value) {
    const raw = (item ?? {}) as Record<string, unknown>;
    const version = typeof raw.version === "string" ? raw.version.trim() : "";
    if (!version) continue;
    out.push({
      version,
      releaseUrl:
        typeof raw.releaseUrl === "string" && raw.releaseUrl.trim()
          ? raw.releaseUrl.trim()
          : null,
      changelog:
        typeof raw.changelog === "string" && raw.changelog.trim()
          ? raw.changelog.trim()
          : null,
      minCmsVersion:
        typeof raw.minCmsVersion === "string" && raw.minCmsVersion.trim()
          ? raw.minCmsVersion.trim()
          : null,
    });
  }
  return out;
}
