export const APP_METADATA = Object.freeze({
  appName: "ZeroBubble App",
  owner: "Chris Ellul",
  version: "v2.03",
  deployedAt: "2026-05-03 17:11 CEST",
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
  return `Copyright © ${APP_METADATA.owner} · ${APP_METADATA.version} · Deployed ${APP_METADATA.deployedAt}`;
}

export function getAppMetadataHeaders() {
  return {
    "X-App-Version": APP_METADATA.version,
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
