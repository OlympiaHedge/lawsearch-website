# Lawsearch — Prestigious Legal Talent

Legal search for law firms and in-house legal teams across the UK, US and UAE. LawSearch Talent Ltd is part of Hampton Hills Group.

## Website

- Responsive navy, ivory and gold identity, with home, expertise, employer, approach, team and contact pages.
- Practice-area-first opportunities board with 16 categories, market and organisation filters, keyword search, shareable URLs and vacancy counts.
- Individual vacancy pages and CV registration that retains the selected practice and market preferences.
- Verified Placements page with selected 2025–2026 appointments. The 100+ placements statement describes the team’s combined careers in recruitment.
- PDF/DOC/DOCX CV uploads (5 MB per file), up to three supporting documents and 10 MB total per submission.
- D1 application records, private R2 uploads and idempotent email delivery to Jacob Fisher with CV/supporting attachments.
- Authenticated recruiter inbox, restricted downloads, delivery retry controls and opt-in job alerts.

## Development and verification

Use the existing pnpm lockfile and Sites-compatible Vinext/Cloudflare configuration. Run `pnpm dev` for development, `pnpm build` for production and `pnpm exec tsc --noEmit --incremental false` for type checking. Run `node --test tests/applications.mjs tests/job-search.mjs` with Node 24 for the application and job-search checks. Tests use an in-memory database, mock private storage and a mocked email provider; they do not send email.

Runtime bindings are `DB` (D1) and `BUCKET` (R2). Preserve the existing `.openai/hosting.json` Site identity. Runtime secrets are configured through hosting, never committed. See `docs/application-email-delivery.md` and `docs/job-alerts.md` for delivery configuration. Job-alert automation remains subject to its existing activation settings.

## Content maintenance

- `lib/practice-areas.ts`: shared practice names, stable URL slugs, descriptions and market labels. Legacy category aliases keep previously loaded application forms compatible.
- `lib/jobs.ts`: recruitment briefs. Keep existing job IDs stable for saved application history. Set `country` to `UK`, `US` or `UAE` and `setting` to `Private practice` or `In-house`; existing briefs default to UK/private practice. Supply `practiceAreas` to cross-list a mixed role without duplicating it. Keep `sector` as the primary practice for applications. Use only current authorised vacancy details.
- `lib/placements.ts`: placement summaries and the team career-experience statement. Candidate identities are omitted from public examples.
- `lib/alert-preferences.ts`: alert preferences and matching, including compatibility with existing subscriptions.

Hosting runs on a Sites-managed Cloudflare Worker with D1 and R2; GitHub Pages cannot run the application backend. Keep the GitHub source mirror aligned with the published Site source when making future changes.
