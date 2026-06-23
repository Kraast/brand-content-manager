# ZB Marketing Dashboard

This repository contains the ZeroBubble / SmartOne marketing dashboard app.

## Repo Layout

All app files live in `zb-content.api-v2.02/` — this is the single source of truth.
(Earlier duplicate copies at the repo root were removed; they were never deployed.)

- `zb-content.api-v2.02/` - static frontend files for Cloudflare Pages
- `zb-content.api-v2.02/worker.js` - Cloudflare Worker API proxy for OpenAI
- `zb-content.api-v2.02/wrangler.jsonc` - Worker configuration

## Cloudflare Setup

This project has two deploy targets:

1. Cloudflare Pages
   - Connect this GitHub repository to Cloudflare Pages
   - Set the Pages root directory to `zb-content.api-v2.02`
   - No build command is required
   - Publish directory: `.`

2. Cloudflare Worker
   - Deploy `zb-content.api-v2.02/worker.js` with Wrangler (`cd zb-content.api-v2.02 && wrangler deploy`)
   - The frontend does NOT auto-deploy the worker — run `wrangler deploy` after any change to `worker.js`
   - Keep the worker name from `wrangler.jsonc`: `zb-content-api`
   - Add the `OPENAI_API_KEY` secret in Cloudflare
   - The worker only accepts browser requests from origins in `ALLOWED_ORIGINS`
     (currently `brand-content-manager.pages.dev` and its Pages preview subdomains).
     Add any custom domain to that list in `worker.js` if one is set up.

## Notes

- `.wrangler/` is ignored because it contains local state
- `*.zip` is ignored so packaging artifacts do not get committed
- `.DS_Store` is ignored
