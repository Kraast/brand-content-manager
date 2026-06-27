// ─── BUMP THESE TWO ON EVERY BUILD ───────────────────────────────────────────
// APP_VERSION  – semantic app version (move v2.03 → v2.04 → … for each release)
// APP_BUILD    – build date as YYYYMMDD (set to the day you deploy)
// DEPLOYED_AT  – human-readable deploy timestamp shown in the footer
// Combined they render as the version label, e.g. "v2.03_build20260627".
// Keep this in sync with the version recorded in the ZB Marketing Dashboard Notion page.
const APP_VERSION = "v2.03";
const APP_BUILD = "20260627";
const DEPLOYED_AT = "2026-06-27 22:53 CEST";

export const APP_METADATA = Object.freeze({
  appName: "ZeroBubble App",
  owner: "Chris Ellul",
  version: APP_VERSION,
  build: APP_BUILD,
  versionLabel: `${APP_VERSION}_build${APP_BUILD}`,
  deployedAt: DEPLOYED_AT,
  legacyPagesRoot: "zb-content.api-v2.02",
  legacyPagesRootStatus: "legacy-folder-name",
  legacyPagesRootNote: "Legacy Cloudflare Pages root folder name, not the current app version.",
});

export const PAGE_METADATA = Object.freeze({
  dashboard: {
    title: "ZeroBubble App",
  },
  marketingKit: {
    title: "Marketing Kit",
  },
  contentGenerator: {
    title: "Content Generator",
  },
  auditTool: {
    title: "Audit Tool",
  },
});

export function getPageTitle(pageKey) {
  const page = PAGE_METADATA[pageKey];
  const baseTitle = page?.title || APP_METADATA.appName;
  return `${baseTitle} ${APP_METADATA.version}`;
}

export function getFooterText() {
  return `Copyright © ${APP_METADATA.owner} · ${APP_METADATA.versionLabel} · Deployed ${APP_METADATA.deployedAt}`;
}

export function getAppMetadataHeaders() {
  return {
    "X-App-Version": APP_METADATA.versionLabel,
    "X-App-Deployed-At": APP_METADATA.deployedAt,
    "X-App-Legacy-Pages-Root": APP_METADATA.legacyPagesRoot,
    "X-App-Legacy-Pages-Root-Status": APP_METADATA.legacyPagesRootStatus,
  };
}

export function applyAppMetadata({ pageKey, footerSelector = "[data-app-footer]" } = {}) {
  const title = getPageTitle(pageKey);
  const footerText = getFooterText();

  if (typeof document !== "undefined") {
    document.title = title;

    const footer = document.querySelector(footerSelector);
    if (footer) {
      footer.textContent = footerText;
    }
  }

  return { title, footerText };
}

if (typeof window !== "undefined") {
  window.APP_METADATA = APP_METADATA;
  window.PAGE_METADATA = PAGE_METADATA;
  window.applyAppMetadata = applyAppMetadata;
}
