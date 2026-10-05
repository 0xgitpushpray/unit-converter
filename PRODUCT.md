# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone who needs a quick unit conversion: cooks, travellers, students, DIYers. Often on a phone, mid-task, wanting one number fast. Also shown as a portfolio piece (confirmed by the owner).

## Product Purpose

A small, dependable unit converter. Success is the right number on screen within seconds, with no ads, accounts or clutter, and a result the user trusts.

## Positioning

A single-purpose, dependency-free tool that works without JavaScript (server-rendered POST pages) and gets faster with it (live conversion). Not an ad-funded converter portal.

## Operating Context

Node.js 18+ HTTP server, no dependencies, no database. `server.js` renders HTML, `converters.js` holds units and logic, `public/style.css` styles, `test.js` tests conversions. Run with `npm start`, tested with `npm test`.

## Capabilities and Constraints

- Existing categories: length (mm, cm, m, km, in, ft, yd, mi), weight (mg, g, kg, oz, lb), temperature (C, F, K; non-linear, below absolute zero is an error).
- Owner approved adding more categories (planned: area, volume, speed, time) with matching conversion logic and tests.
- Owner approved client-side JS (instant conversion, swap units, copy result) on top of the server-rendered pages. The no-JS POST flow must keep working.
- No npm dependencies. Conversions must stay numerically correct; results are rounded with `format()` (10 significant digits).

## Brand Commitments

Name "Unit Converter" and the existing page routes (`/length`, `/weight`, `/temperature`). No other brand constraints; the look is free to change.

## Evidence on Hand

Working conversion logic and tests in the repo. No logo, testimonials, usage data or external references exist and none may be invented.

## Product Principles

- The answer comes first: the number is the loudest thing on the page.
- Works without JavaScript; JavaScript only makes it faster.
- Never show a wrong or ambiguous number: errors name the problem.
- One tool, done well, over a feature list.
