# ZB Marketing Dashboard

This repository contains the ZeroBubble / SmartOne marketing dashboard app.

## Versioning

- The app version source of truth lives in `app-metadata.mjs`
- The current app version is defined in `app-metadata.mjs` and is currently `v2.03`
- `zb-content.api-v2.02/` is a legacy Cloudflare Pages deploy-root folder name, not the current app version
- Keep the workspace root files and the matching files inside `zb-content.api-v2.02/` in sync when shipping deployable changes
- Use `node scripts/release-sync.mjs --sync-only` after root-file edits to refresh the legacy deploy-root mirror
- Use `node scripts/release-sync.mjs --version v2.04 --deployed-at "2026-05-18 09:30 CEST"` for the next version bump pattern
- `wrangler.jsonc` is the dedicated Cloudflare Pages config used from the repo root
- `wrangler.worker.jsonc` is the Worker config source of truth and is mirrored into `zb-content.api-v2.02/wrangler.jsonc`

## Repo Layout

- Root files - primary working copy and source of truth for app code in this workspace
- `app-metadata.mjs` - shared app version, footer, deploy, and legacy-root metadata
- `scripts/release-sync.mjs` - release helper for version bumps, deploy timestamp updates, and legacy-root sync
- `wrangler.jsonc` - repo-root Cloudflare Pages config for `brand-content-manager`
- `wrangler.worker.jsonc` - source-of-truth Cloudflare Worker config for `zb-content-api`
- `zb-content.api-v2.02/` - legacy-named Cloudflare Pages root that should mirror the current root app files
- `zb-content.api-v2.02/worker.js` - mirrored Cloudflare Worker API proxy for OpenAI
- `zb-content.api-v2.02/wrangler.jsonc` - mirrored Worker configuration generated from `wrangler.worker.jsonc`

## Cloudflare Setup

This project has two deploy targets:

1. Cloudflare Pages
   - Connect this GitHub repository to Cloudflare Pages
   - Set the Pages root directory to `zb-content.api-v2.02`
   - Treat that folder name as a legacy deploy-root label only
   - No build command is required
   - Publish directory: `.`
   - For Wrangler CLI deploys from the repo root, use `wrangler pages deploy zb-content.api-v2.02 --project-name brand-content-manager`

2. Cloudflare Worker
   - Deploy `zb-content.api-v2.02/worker.js` with Wrangler, or keep the mirrored root copy aligned before deploying from either location
   - Keep the worker name from `wrangler.worker.jsonc`: `zb-content-api`
   - Add the `OPENAI_API_KEY` secret in Cloudflare
   - Add `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` for Shopify publishing
   - Add `META_PAGE_ACCESS_TOKEN` for Facebook / Instagram publishing
   - Add `PUBLISH_ADMIN_TOKEN` for protected publish endpoints used by the app UI
   - Create the R2 bucket `zb-marketing-reference-library` for saved brand reference images, or change the bucket name in `wrangler.worker.jsonc` before deploying

## Runtime Metadata

- Page titles and footer deploy text now read from `app-metadata.mjs`
- The worker exposes the same shared metadata at `GET /metadata`
- `wrangler.worker.jsonc` documents the Worker runtime config, and `wrangler.jsonc` exists only for Pages deploy routing

## Publishing Setup

- Non-sensitive publishing defaults now live in `worker.js`
- Set the real secrets in Cloudflare Worker secrets, not in frontend files
- Shopify Dev Dashboard apps use the client credentials grant. The Worker exchanges the client ID and secret for a fresh 24-hour Shopify access token when needed.
- The protected `GET /publishing/shopify/blogs` endpoint returns the available Shopify blog IDs after the store domain and client credentials are configured.
- `content-generator.html` now includes a publishing access panel where you can save the internal `PUBLISH_ADMIN_TOKEN` locally in each browser
- The publishing panel now explains live blockers such as missing Worker secrets, placeholder IDs/domains, and Instagram's current public-image requirement
- `content-generator.html` now includes an R2-backed per-brand reference image library layered on top of the existing manual reference uploads
- Saved reference images are stored under `zerobubble/` or `smartone/` and support these tags:
  - `device`
  - `logo`
  - `environment`
  - `style-guide`
  - `campaign-reference`
  - `do-not-deviate`
- Library reads are intentionally left open so the generator can browse saved references without forcing a token check on every load. Upload and delete actions still require the internal `PUBLISH_ADMIN_TOKEN`.
- Shopify publishing currently targets:
  - Blog Post -> Shopify Blog Article
  - Other website content types -> Shopify Page
- Meta publishing currently supports:
  - Facebook Page publishing directly from the generated caption and image
  - Instagram endpoint scaffolding, but it still needs a public image URL on the Worker side before direct feed publishing is fully seamless

## Release Flow

1. Make your root-level app changes first.
2. When you are ready to prepare a new release, run `node scripts/release-sync.mjs --version v2.04 --deployed-at "YYYY-MM-DD HH:MM TZ"`.
3. If you only changed app files and need to refresh the legacy deploy-root mirror, run `node scripts/release-sync.mjs --sync-only`.
4. Deploy Cloudflare Pages from the repo root with `wrangler pages deploy zb-content.api-v2.02 --project-name brand-content-manager`.
5. Deploy the Worker from the mirrored worker files, or from the root with `wrangler deploy --config wrangler.worker.jsonc`.

## v2.04 Checklist

1. Finish the next batch of app changes in the root workspace files.
2. Choose the real release timestamp you want shown in the footer and metadata.
3. Run `node scripts/release-sync.mjs --version v2.04 --deployed-at "YYYY-MM-DD HH:MM TZ"`.
4. Sanity-check page titles, footer version text, and `GET /metadata`.
5. Confirm the mirrored files inside `zb-content.api-v2.02/` reflect the same release.
6. Deploy Cloudflare Pages from the repo root with `wrangler pages deploy zb-content.api-v2.02 --project-name brand-content-manager`.
7. Deploy the Worker using the mirrored worker files and current secrets, or from the root with `wrangler deploy --config wrangler.worker.jsonc`.

## Notes

- `.wrangler/` is ignored because it contains local state
- `*.zip` is ignored so packaging artifacts do not get committed
- `.DS_Store` is ignored
