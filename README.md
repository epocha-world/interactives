# EPOCHA · KORCOS 2026

Anonymous reflection activity with 97 questions, six category boards, example actions, and consent before the first spin. Polling preserves existing cards and expanded questions. Colors follow the system preference.

## Local preview

Run `node build.cjs` and serve the generated `dist/` directory with a static web server. With no configuration it runs in browser-only preview mode. Your ignored local `config.js`, if present, supplies the Supabase URL and publishable key for a connected local build.

Questions and example actions live in `config.template.json`. Rebuild after changing them.

## Vercel

Set `SUPABASE_URL` (HTTPS project URL) and `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...` browser key) for your deployment environments. `vercel.json` runs `node build.cjs` and publishes only `dist/`. No packages are required. Missing configuration fails the Vercel build. Never supply a secret or service-role key: browser configuration is visible to site visitors.

## Supabase

Run `supabase-setup.sql` for a new project. Use `supabase-upgrade.sql` only when upgrading the previous table. `supabase-trigger-permissions.sql` restricts the optional internal RLS event trigger and applies only to projects that have that function. SQL schemas are public source, not response datasets, and are excluded from the deployed site.

The connected project already has the table and policies. Submissions store `category`, the exact displayed `question`, the action (`body`), and server-generated `created_at`; `id` enables safe retries and `event_id` scopes the event. Public visitors can read and insert, but cannot edit/delete rows or supply a timestamp. Examples are excluded from responses and participant counts.

Consent is kept only in page memory and requested again on reload. No name, email, login, or consent record is collected. Submitted text appears publicly and may be used in reports, as explained before consent. Participants must avoid identifying details. Providers may retain operational request logs.

## Repository hygiene

Local configuration, environment files, build output, logs, private keys, exports, and agent state are ignored. Do not commit participant exports or private source documents. The previously committed Supabase publishable key is public by design; removing configuration from future commits does not erase Git history.

Browser checks cover consent, question association, retry safety, live updates, stable polling, accordion behavior, and both themes. Actual Supabase submission and an independent browser update were verified. Vercel deployment has not been verified.
