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
    build: null,
    deployedAt: null,
    syncOnly: false,
    noStamp: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--sync-only") {
      options.syncOnly = true;
      continue;
    }

    if (arg === "--no-stamp") {
      options.noStamp = true;
      continue;
    }

    if (arg === "--version") {
      options.version = argv[index + 1] || null;
      index += 1;
      continue;
    }

    if (arg === "--build") {
      options.build = argv[index + 1] || null;
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
  node scripts/release-sync.mjs                       Auto-stamp build date + deploy time, then mirror
  node scripts/release-sync.mjs --version v2.04       Bump version, auto-stamp build/time, then mirror
  node scripts/release-sync.mjs --sync-only           Mirror only — leave version/build/time untouched

Flags:
  --version v2.04        Set APP_VERSION (format vMAJOR.MINOR). Auto-stamps build + time too.
  --build 20260627       Override the auto build date (YYYYMMDD) instead of using today.
  --deployed-at "..."    Override the auto deploy timestamp instead of using now.
  --no-stamp             Skip auto-stamping (only meaningful with --version, to bump version alone).
  --sync-only            Mirror deploy files only; make no metadata changes.

What it does:
  1. Unless --sync-only, stamps app-metadata.mjs: APP_BUILD = today (Europe/Malta),
     DEPLOYED_AT = now, and APP_VERSION if --version is given. Version label becomes
     e.g. v2.04_build20260627 automatically.
  2. Refreshes README guidance so it points to app-metadata.mjs as the live source of truth.
  3. Mirrors deploy files from the repo root into the legacy Pages root folder.
`);
}

// Build the Malta-local build date (YYYYMMDD) and deploy timestamp (YYYY-MM-DD HH:MM CET/CEST).
function getMaltaStamp(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Malta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(date).map((part) => [part.type, part.value]));
  const hour = p.hour === "24" ? "00" : p.hour; // some ICU builds emit "24" at midnight

  // Determine CET vs CEST from the actual UTC offset (whole hours for Malta).
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const maltaDate = new Date(date.toLocaleString("en-US", { timeZone: "Europe/Malta" }));
  const offsetHours = Math.round((maltaDate - utcDate) / 3600000);
  const tz = offsetHours >= 2 ? "CEST" : "CET";

  return {
    build: `${p.year}${p.month}${p.day}`,
    deployedAt: `${p.year}-${p.month}-${p.day} ${hour}:${p.minute} ${tz}`,
  };
}

function replaceConst(source, name, nextValue) {
  const pattern = new RegExp(`(const ${name}\\s*=\\s*")([^"]*)(")`);
  if (!pattern.test(source)) {
    throw new Error(`Could not find const ${name} in app-metadata.mjs`);
  }

  return source.replace(pattern, `$1${nextValue}$3`);
}

async function loadMetadata() {
  const moduleUrl = new URL(`file://${metadataPath}`);
  const module = await import(`${moduleUrl.href}?t=${Date.now()}`);
  return module.APP_METADATA;
}

async function updateMetadataFile({ version, build, deployedAt }) {
  let source = await fs.readFile(metadataPath, "utf8");

  if (version) {
    source = replaceConst(source, "APP_VERSION", version);
  }

  if (build) {
    source = replaceConst(source, "APP_BUILD", build);
  }

  if (deployedAt) {
    source = replaceConst(source, "DEPLOYED_AT", deployedAt);
  }

  await fs.writeFile(metadataPath, source, "utf8");
}

async function updateReadmeVersionGuidance(metadata) {
  let source = await fs.readFile(readmePath, "utf8");

  // Idempotent: rewrites only the version label between the trailing backticks, leaving
  // the surrounding guidance intact so repeated runs don't compound the sentence.
  source = source.replace(
    /(- The current app version is defined in `app-metadata\.mjs` and is currently `)[^`]+(`)/,
    `$1${metadata.versionLabel}$2`
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

  if (options.syncOnly && (options.version || options.build || options.deployedAt)) {
    throw new Error("--sync-only cannot be combined with --version / --build / --deployed-at.");
  }

  if (options.version && !/^v\d+\.\d+$/.test(options.version)) {
    throw new Error("Version must look like v2.04");
  }

  if (options.build && !/^\d{8}$/.test(options.build)) {
    throw new Error("Build must be a date in YYYYMMDD form, e.g. 20260627");
  }

  // A real release run (anything that isn't --sync-only) auto-stamps the build date and
  // deploy timestamp so they can never go stale. Explicit --build / --deployed-at override
  // the auto values; --no-stamp suppresses auto-stamping (e.g. to bump --version alone).
  if (!options.syncOnly) {
    const stamp = options.noStamp ? null : getMaltaStamp();
    await updateMetadataFile({
      version: options.version,
      build: options.build ?? stamp?.build ?? null,
      deployedAt: options.deployedAt ?? stamp?.deployedAt ?? null,
    });
  }

  const metadata = await loadMetadata();
  const legacyRoot = await ensureLegacyRoot(metadata);

  await updateReadmeVersionGuidance(metadata);
  await mirrorFiles(legacyRoot);

  console.log(`Release sync complete.
Version: ${metadata.versionLabel}
Deployed at: ${metadata.deployedAt}
Legacy Pages root: ${metadata.legacyPagesRoot}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
