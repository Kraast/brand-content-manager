import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const metadataPath = path.join(repoRoot, "app-metadata.mjs");
const readmePath = path.join(repoRoot, "README.md");

const mirrorTargets = [
  { source: "app-metadata.mjs", target: "app-metadata.mjs" },
  { source: "index.html", target: "index.html" },
  { source: "marketing-kit.html", target: "marketing-kit.html" },
  { source: "content-generator.html", target: "content-generator.html" },
  { source: "audit-tool.html", target: "audit-tool.html" },
  { source: "brand-config.js", target: "brand-config.js" },
  { source: "worker.js", target: "worker.js" },
  { source: "wrangler.worker.jsonc", target: "wrangler.jsonc" },
  { source: "logo.png", target: "logo.png" },
  { source: "smartone-logo-white.png", target: "smartone-logo-white.png" },
  { source: "zerobubble-logo-white.png", target: "zerobubble-logo-white.png" },
];

function parseArgs(argv) {
  const options = {
    version: null,
    deployedAt: null,
    syncOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--sync-only") {
      options.syncOnly = true;
      continue;
    }

    if (arg === "--version") {
      options.version = argv[index + 1] || null;
      index += 1;
      continue;
    }

    if (arg === "--deployed-at") {
      options.deployedAt = argv[index + 1] || null;
      index += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node scripts/release-sync.mjs --sync-only
  node scripts/release-sync.mjs --version v2.04 --deployed-at "2026-05-18 09:30 CEST"

What it does:
  1. Optionally updates version and deploy timestamp in app-metadata.mjs
  2. Refreshes README guidance so it points to app-metadata.mjs as the live source of truth
  3. Mirrors deploy files from the repo root into the legacy Pages root folder
`);
}

function replaceQuotedField(source, fieldName, nextValue) {
  const pattern = new RegExp(`(${fieldName}:\\s*\")([^\"]*)(\")`);
  if (!pattern.test(source)) {
    throw new Error(`Could not find ${fieldName} in app-metadata.mjs`);
  }

  return source.replace(pattern, `$1${nextValue}$3`);
}

async function loadMetadata() {
  const moduleUrl = new URL(`file://${metadataPath}`);
  const module = await import(`${moduleUrl.href}?t=${Date.now()}`);
  return module.APP_METADATA;
}

async function updateMetadataFile({ version, deployedAt }) {
  let source = await fs.readFile(metadataPath, "utf8");

  if (version) {
    source = replaceQuotedField(source, "version", version);
  }

  if (deployedAt) {
    source = replaceQuotedField(source, "deployedAt", deployedAt);
  }

  await fs.writeFile(metadataPath, source, "utf8");
}

async function updateReadmeVersionGuidance(metadata) {
  let source = await fs.readFile(readmePath, "utf8");

  source = source.replace(
    /- The current app version is `[^`]+`/,
    `- The current app version is defined in \`app-metadata.mjs\` and is currently \`${metadata.version}\``
  );

  await fs.writeFile(readmePath, source, "utf8");
}

async function ensureLegacyRoot(metadata) {
  const legacyRoot = path.join(repoRoot, metadata.legacyPagesRoot);
  await fs.mkdir(legacyRoot, { recursive: true });
  return legacyRoot;
}

async function mirrorFiles(legacyRoot) {
  for (const entry of mirrorTargets) {
    const sourcePath = path.join(repoRoot, entry.source);
    const targetPath = path.join(legacyRoot, entry.target);
    await fs.copyFile(sourcePath, targetPath);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.syncOnly && !options.version && !options.deployedAt) {
    throw new Error("Provide --sync-only or at least one of --version / --deployed-at.");
  }

  if (options.version && !/^v\d+\.\d+$/.test(options.version)) {
    throw new Error("Version must look like v2.04");
  }

  if (options.version || options.deployedAt) {
    await updateMetadataFile(options);
  }

  const metadata = await loadMetadata();
  const legacyRoot = await ensureLegacyRoot(metadata);

  await updateReadmeVersionGuidance(metadata);
  await mirrorFiles(legacyRoot);

  console.log(`Release sync complete.
Version: ${metadata.version}
Deployed at: ${metadata.deployedAt}
Legacy Pages root: ${metadata.legacyPagesRoot}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
