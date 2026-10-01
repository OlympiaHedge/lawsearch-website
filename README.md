# Lawsearch

Boutique legal recruitment website for LawSearch Talent Ltd, part of Hampton Hills Group.

## Included

- Responsive navy and gold brand, home, specialisms, employers, about and contact pages.
- Searchable careers page, individual role pages and role-specific application flow.
- PDF/DOC/DOCX CV uploads (maximum 5 MB), validation, application references and retry protection.
- D1 application records and private R2 CV storage.
- Recruiter inbox and CV downloads restricted by the hosted `ADMIN_EMAIL` allowlist and ChatGPT sign-in.
- Candidate privacy notice and accessible error/success states.

## Development

Install dependencies using the existing pnpm lockfile. The repository includes the Sites-compatible Vinext/Cloudflare build configuration. Use `pnpm dev` in a supported local environment and `pnpm build` for production. Type checking: `pnpm exec tsc --noEmit`.

Runtime bindings: `DB` (D1), `BUCKET` (R2). Generate schema migrations with `pnpm db:generate`. Production migrations are applied by Sites during publication. Configure `ADMIN_EMAIL` as a hosted runtime variable; it must match the authorised recruiter's ChatGPT account email. Never commit secrets.

## Vacancy maintenance

Edit `lib/jobs.ts` to add, change or close vacancies. Job IDs are stable references used by application records. Current entries are based on recruitment briefs discussed on 1 October 2026. The five general conveyancing locations share the advertised £45,000–£60,000 range; exact individual role packages need confirmation. Client names and candidate personal details are not published.

## Launch notes

The initial hosted version is private for review. Review current vacancy availability, individual packages, company details and the candidate privacy/retention arrangements before public sharing. Email enquiries open the visitor's email application. Applications are saved in the recruiter inbox; automatic email notifications are not configured.

The code can be pushed to an authorised GitHub repository once the user's GitHub account is connected. Hosting currently uses the Sites-managed Cloudflare Worker, D1 and R2 configuration; GitHub Pages alone cannot run the CV submission backend.
