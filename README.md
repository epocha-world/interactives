# EPOCHA · KORCOS 2026

Open `index.html` through a static web server to preview. The original mock-up styling and competency content are preserved. Questions are intentionally blank; edit the six arrays in `config.js` when ready. Participants must spin before submitting. Responses are limited to 500 characters and rendered as text.

## Connect the shared board

1. Create a Supabase project and run `supabase-setup.sql` once in its SQL editor.
2. In `config.js`, fill in the project URL and **publishable** API key. Never use a secret or service-role key. These settings are public.
3. Deploy this folder to Vercel as a static site (Other framework, no build command, root output directory).
4. Test the deployed site on two devices: submit on one and confirm the response appears under the same letter on the other within a few seconds.

The shared board polls Supabase every two seconds and refreshes after submission. No additional packages are required. Without configuration, preview responses persist only in the same browser; the page labels this mode explicitly. Failed submissions retain the answer, and retries use the same response ID to avoid duplicates.

This is a public, anonymous event board: anyone with the site can read and submit. Participants cannot edit or delete responses. Organizers can remove inappropriate responses in the Supabase table editor. There is no moderation queue or anti-spam protection yet. Before wider public promotion, decide whether the event needs those controls. Do not invite participants to post private information.

The schema is scoped to `korcos-2026`. Changing the event identifier requires updating the database constraint and policies as well as the config.

Database connectivity and multi-device behavior require a configured Supabase project; they cannot be verified in local preview mode.
