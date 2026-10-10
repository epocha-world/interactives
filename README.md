# EPOCHA · KORCOS 2026

Open `index.html` through a static web server to preview. Content follows the updated event mock-up and uses the EPOCHA brand palette. The final question list is in `config.js`: E 18, P 15, O 16, C 18, H 14, A 16. Participants must consent before their first spin and spin before submitting. Responses are limited to 500 characters and rendered as text.

## Connect the shared board

The current page is connected to the `epocha` Supabase project (`wgmhrtdkudjhsuchnycw`). Its `vision_steps` table and read/insert policies are installed. The publishable browser key is configured; secret keys are not used.

1. Run `supabase-setup.sql` once in a new Supabase project. If the previous table already exists, use `supabase-upgrade.sql` instead to preserve existing responses.
2. In `config.js`, fill in the project URL and **publishable** API key. Never use a secret or service-role key. These settings are public.
3. Deploy this folder to Vercel as a static site (Other framework, no build command, root output directory).
4. Test the deployed site on two devices: submit on one and confirm the response appears under the same letter on the other within a few seconds.

The shared board polls Supabase every two seconds and refreshes after submission. No additional packages are required. Without configuration, preview responses persist only in the same browser; the page labels this mode explicitly. Failed submissions retain the answer, and retries use the same response ID to avoid duplicates.

This is a public, anonymous event board: anyone with the site can read and submit. Participants cannot edit or delete responses. Organizers can remove inappropriate responses in the Supabase table editor. There is no moderation queue or anti-spam protection yet. Before wider public promotion, decide whether the event needs those controls. Do not invite participants to post private information.

The schema is scoped to `korcos-2026`. Changing the event identifier requires updating the database constraint and policies as well as the config.

Verified against the real project: consent → browser submission → database row with the exact category/question/action and a server timestamp → automatic appearance in a second independent browser session. Wrong events, invalid categories, client-supplied timestamps, and public deletion were rejected. The labelled test response was removed after verification. The Vercel deployment remains unverified.

## Collection and consent

Each submission stores the wheel category, the exact displayed reflection question, the action (`body`), and the server-generated `created_at` timestamp. A response ID supports safe retries and `event_id` separates the event. The browser cannot supply a timestamp through its column-level INSERT grants. No participant identity or consent field is collected. The checkbox is unchecked initially and is held only in page memory; reload requires consent again. Cancel/Escape reveals no result and submits no data.

The six preset actions are labelled examples, appear in every board category, and are excluded from participant counts and the database. Drafts must be submitted or cleared before changing category or question, so a saved answer retains the correct context. Old responses have no historical question; the upgrade does not invent one.

Anonymous here means no identifying fields are requested in the response dataset. Hosting and database providers may retain operational request logs. Participants must avoid identifiable free text. Public reporting and quotation use are explained before consent; the application does not store proof of consent, as requested.
