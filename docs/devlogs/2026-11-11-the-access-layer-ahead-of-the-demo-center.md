# The access layer ahead of the demo center

date: 2026-11-11
project: ktema_www
related:

- demo center (demo.ktema.systems)
- delta as a demo artifact (2026-11-11)

## Context

The demo center was planned with an email gate in front of it, and three ways of building that gate were proposed: a serverless one-time password, a licence for the desktop application, and Cloudflare Access. The gate is deferred until the center exists. This note records what was checked so the decision does not have to be reconstructed, and so the build does not accidentally close a door. Nothing described here is built.

## What the repository says

| Fact | Evidence |
|---|---|
| The site is a static Astro build on Cloudflare Pages, project `ktema-www`, served at `ktema-www.pages.dev`. | `deploy.sh`, `.github/workflows/deploy-cf-pages.yml` |
| Deploy runs only on a push to `main`, with `CF_PAGES_DEPLOY` and `CF_ACCOUNT_ID`. | same workflow |
| No custom domain is attached and `site` is unset, because the production domain was not chosen. | `astro.config.mjs`, README `Not yet set` |
| The Cloudflare account is already the host, so Workers, Pages Functions and Zero Trust are one configuration away rather than a new vendor. | the deploy above |

## The three options

Serverless one-time password. The only form that protects anything is a request-level gate: a Pages `functions/_middleware.ts` or a Worker that refuses to serve the page and its assets without a signed session cookie. A check written inside the application protects nothing, because `projects.json` and the JavaScript are separate fetches that a reader can open directly. The work is larger than it looks: an OTP store, a rate limit, an email provider with SPF and DKIM on the sending domain, a cookie signing key, an allow list, and a revocation procedure.

Desktop licence. This answers a different question. Once a binary is downloaded, an email check in the application is a deterrent. It does not gate the web demo, and the web demo is the same build.

Cloudflare Access. This is the cheapest and it covers assets, because it refuses the request before Pages. Two corrections to the proposal that named it. Access ships a built-in One-time PIN provider, so the email-only experience does not need a custom function. Access applications attach to hostnames in a zone the account owns, so `ktema-www.pages.dev` cannot be protected and a custom domain is a prerequisite, not a detail. The free plan covers fifty users, and revocation is one policy edit.

## Decision

Deferred. When the gate is needed, the order is: attach `demo.ktema.systems` to the project and put Access with One-time PIN over that hostname, with an explicit email list as the policy. The reason is that access control belongs at the request boundary, where the assets are covered and revocation is central, and the alternative costs a store, a mail sender, and a rate limit to arrive at the same guarantee.

What would change this decision. Access puts a Cloudflare login page in front of the first screen a prospect sees. If that first impression is a business cost, the same control can be had with per-person signed links verified by a Worker, at the price of a secret and a link record. Both are edge solutions. The client-side form belongs to lead capture, and calling it a gate is the one thing to avoid.

## What to revisit

- Whether `ktema.systems` is a zone on the same Cloudflare account, which Access requires.
- Who maintains the allow list, and how a person is removed.
- Whether the artifact behind the gate is a page, a set of assets, or a downloadable build, since the three need different work.
- Whether any demo needs a live backend. If one does, the gate must cover the API as well, and that is a service rather than a policy.
