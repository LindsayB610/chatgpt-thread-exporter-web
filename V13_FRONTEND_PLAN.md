# v1.3 Frontend Plan

## Purpose

`v1.3` adds a lightweight public frontend for `chatgpt-thread-exporter`.

The goal is a simple web app where someone can:

- paste a public ChatGPT shared link
- choose Markdown or PDF
- run the export
- download the result

This frontend should feel like the hosted companion to the CLI, not a separate product.

## Product Positioning

The intended model is:

- the CLI remains the open-source core tool
- the frontend is an official hosted implementation of that tool
- the maintainer-operated hosted instance may live on a dedicated subdomain
- other people should still be able to self-host the frontend if they want

For Lindsay’s deployment, the likely public URL is:

- `exporter.lindsaybrunner.com`

That domain should be treated as deployment configuration, not as something hardcoded into the reusable app logic.

## Key Principles

1. Keep the frontend thin.
   The frontend should reuse the existing export engine concepts and behavior as much as possible.

2. Preserve the local-first spirit where possible.
   If browser-only execution is feasible, prefer it. If not, use the smallest backend surface that makes the product reliable.

3. Optimize for normal humans, not developers.
   The app should feel easier than Terminal, with clear defaults and plain language.

4. Match the current CLI behavior where that helps trust.
   That includes:
   - Markdown vs PDF choice
   - unique filename behavior
   - clear success/failure messaging

5. Be explicit about privacy.
   Users should understand whether their shared link is processed in-browser, sent to a backend, or both.

## Recommended Architecture

## Preferred shape

A separate small frontend app, deployed separately from the Hugo site.

Recommended stack:

- Vite
- React
- TypeScript
- Netlify hosting

Why:

- this matches the shape of `yarny-app`
- it keeps app concerns out of the Hugo repo
- Netlify subdomain hosting should be straightforward
- it leaves room for lightweight Netlify Functions if browser-only export proves unreliable

## Why not build it inside the Hugo site

Avoid putting the exporter UI directly inside `Lindsay-Brunner-Website` because:

- the exporter is an interactive app, not content
- export logic and possible server helpers will be cleaner in a dedicated app
- Hugo templates are the wrong place for a growing product UI
- separate deploys will make iteration much easier

## Why not use a microfrontend

A microfrontend is not necessary here.

This app should be:

- one focused frontend
- one job
- one deployment

Using a microfrontend architecture would add complexity without real product benefit.

## Hosting and Domain Strategy

The current website setup suggests a familiar path:

- keep `lindsaybrunner.com` on its existing Hugo + Netlify setup
- create a new Netlify site for the exporter frontend
- attach `exporter.lindsaybrunner.com` as that new site’s custom domain

This is the same general operating model as:

- OSS codebase
- official hosted instance
- optional self-hosting by others

## Reference from existing projects

`yarny-app` is a good reference for deployment shape:

- separate app project
- Vite build
- Netlify deployment
- `dist` publish directory
- optional `netlify/functions`

That suggests the exporter frontend should likely use:

- `npm run build`
- publish directory: `dist`
- optional `netlify/functions` only if needed

## Core User Flow

The first public frontend version should do only a few things, very well.

### MVP flow

1. User lands on the page.
2. User pastes a ChatGPT shared link.
3. User picks an export format:
   - Markdown
   - PDF
4. User clicks `Export`.
5. App validates the link and runs the export.
6. App provides a download action for the generated file.

## Suggested UI sections

1. Hero / intro
   Short explanation of what the tool does.

2. Export form
   - shared link input
   - format toggle
   - export button

3. Status area
   - validating
   - exporting
   - success
   - clear errors

4. Result area
   - download button
   - maybe file name preview

5. Privacy note
   A short plain-language explanation of how processing works.

## UX Requirements

The frontend should be dramatically simpler than the CLI, but preserve the same trust signals.

### Must-have UX behaviors

- clear required input state
- obvious format choice
- friendly loading state
- clear failure messages
- obvious download button after success
- no developer jargon in the main flow

### Tone

Plain, calm, straightforward, useful.

The app should feel:

- practical
- lightweight
- trustworthy

Not:

- overdesigned
- startup-pitchy
- overly technical

## Execution Model Decision

This is the main technical fork for `v1.3`.

### Option A: Browser-first

The frontend does as much as possible in the browser.

Pros:

- better privacy story
- simpler backend posture
- easier to say the data stays on the user’s machine/browser

Cons:

- shared-link fetching may run into browser constraints
- PDF generation in-browser may be more limited or heavier
- image enrichment may be trickier

### Option B: Thin backend helper

The frontend sends the shared link to a backend endpoint that runs the export logic.

Pros:

- simpler and more reliable fetch behavior
- easier PDF generation
- easier DOM enrichment using browser automation on the server side

Cons:

- user content touches hosted infrastructure
- privacy story is more complex
- backend operations become part of the product

## Recommended approach

Start by proving the frontend with the simplest reliable architecture, not the purest one.

Practical recommendation:

1. Build the UI first in a frontend app.
2. Use a thin backend helper if needed to keep export behavior consistent with the CLI.
3. Be explicit in the UI about where processing happens.

Given the current CLI:

- PDF export already depends on Playwright
- DOM enrichment already depends on browser rendering

That makes a small backend helper a realistic and probably cleaner choice for the hosted version.

## Feature Scope for v1.3

## In scope

- paste shared link
- export Markdown
- export PDF
- download result
- clear validation and error states
- hosted public app
- official deployment on a subdomain

## Out of scope for first pass

- user accounts
- saved history
- multi-file project management
- GitHub export from the web UI
- deep settings UI
- custom themes
- login-gated features

## Relationship to Existing Releases

- `v1.0` = polished local CLI
- `v1.1` = GitHub writer
- `v1.2` = ChatGPT-inspired PDF export
- `v1.3` = lightweight hosted frontend

The frontend should present the existing export capability, not replace it.

## Implementation Phases for v1.3

### Phase A: Product and architecture decision

Done when:

- stack is chosen
- browser-first vs backend-helper decision is made
- repo location is decided
- deployment approach is clear

### Phase B: Frontend scaffold

Build:

- new app project
- basic design system / layout
- link input
- format selector
- export button
- result state shell

Done when:

- app runs locally
- static UI exists end to end

### Phase C: Export integration

Build:

- shared link validation
- Markdown export flow
- PDF export flow
- download handling
- error handling

Done when:

- real shared link can produce a download

### Phase D: Hosted deployment

Build:

- Netlify site setup
- environment/config setup if needed
- subdomain attachment
- production smoke test

Done when:

- hosted public app works on the intended subdomain

### Phase E: Frontend polish

Build:

- copy cleanup
- privacy messaging
- accessibility pass
- mobile layout pass
- final visual QA

Done when:

- app feels polished enough to be the official hosted version

## Technical Questions to Answer Early

1. Is export processing browser-only, backend-assisted, or fully backend-run?
2. Will the frontend share code directly from the CLI repo, or use a separate adapted implementation?
3. If backend helpers are needed, do they live as:
   - Netlify Functions in the frontend repo
   - or shared server code elsewhere?
4. How should PDF generation work in the hosted environment?
5. How explicit should the privacy explanation be in the UI?

## Suggested Repo Strategy

Recommended:

- create a separate frontend project, likely sibling to the CLI repo
- keep `chatgpt-thread-exporter` as the CLI/core reference implementation
- optionally share small utilities later if it becomes worth it

Possible project name:

- `chatgpt-thread-exporter-web`

## Suggested Netlify Shape

Based on `yarny-app`, a reasonable starting point is:

- Vite build
- publish directory: `dist`
- Netlify-managed custom domain
- optional `netlify/functions` for server helpers

## Initial Success Criteria

The first acceptable hosted version should let a non-technical user:

1. open the site
2. paste a shared link
3. choose Markdown or PDF
4. click one button
5. download a readable result

If that flow feels smooth, `v1.3` is on the right track.

## Handoff for New Thread

Use this as the starter context in the next thread:

```text
We are starting v1.3 for chatgpt-thread-exporter: a lightweight hosted frontend for the existing CLI/export engine.

Current state:
- v1.0 shipped local CLI export
- v1.1 shipped GitHub export
- v1.2 shipped ChatGPT-inspired PDF export

The frontend should be:
- a separate small app, not inside the Hugo site repo
- hosted on Netlify
- likely deployed at exporter.lindsaybrunner.com as the official hosted instance
- still conceptually self-hostable by others

Reference context:
- lindsaybrunner.com is a Hugo site in /Users/lindsaybrunner/Documents/Lindsay-Brunner-Website
- yarny-app in /Users/lindsaybrunner/Documents/yarny-app is a good reference for a separate Netlify/Vite app

Goal:
- paste shared link
- choose Markdown or PDF
- export and download

Please start by helping choose the frontend architecture and scaffold the new app.
```
