# SunSizer — Solar PV Sizing & Quotation (skeleton prototype)

A client-side prototype that proves the flow and the maths of a Solar PV sizing, cost-estimation and quotation tool.
Built with Next.js (App Router), TypeScript and Tailwind CSS. No backend, database, login or PDF library.

Formulas follow the two engineering guides supplied with the project brief
(*Engineering Guide* = G1, *Engineering Framework* = G2). Each formula is written as a comment above its function in `lib/calculations.ts`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run verify     # checks the demo example (needs Node 22+)
npm run build      # production build
```

## Project structure

```
app/
  layout.tsx, globals.css   Theme (cream / dark brown / amber), print styles
  page.tsx                  Page 1 — landing (one screen)
  quote/page.tsx            Page 2 — quotation system; holds all state, derives results live
components/
  Stepper.tsx               4-step progress indicator
  StepLoadAudit.tsx         Step 1 — customer fields, appliance table, running totals
  StepDesign.tsx            Step 2 — backup / battery / panel choices, advanced assumptions
  StepResults.tsx           Step 3 — inverter, battery, solar, backup time, MPPT cards
  StepQuotation.tsx         Step 4 — cost table, markup, grand total, print button
  QuotationPreview.tsx      Printable quotation document
  NumberInput.tsx, Issues.tsx, Placeholder.tsx
lib/
  calculations.ts           ALL maths: pure functions, no React
  data.ts                   Presets, demo appliances, demo price book
  types.ts, format.ts       Shared types, Naira / number formatting
scripts/verify-demo.mts     Runs the demo example through the engine
```

## Implemented

- Load audit: connected load, daily energy (Wh and kWh), average power
- Inverter sizing (design margin, power factor, round up to standard kVA list)
- Battery sizing for lithium and tubular (DoD, efficiencies, 24 V / 48 V rule, Ah, unit count, series/parallel for tubular)
- PV array sizing (PSH, PR, panel count, installed kWp)
- Estimated backup time and approximate MPPT charging current
- Basic validation: zero/negative values are errors, hours above 24 are a warning
- Itemised cost table with editable unit prices, markup toggle/percent, Naira formatting
- Quotation preview and browser print (`window.print()`) as a "Save as PDF" stand-in

## Stubbed / not in this prototype

- Professional Engineer Mode (disabled toggle only)
- Login, user accounts, customer records
- Database / saving or reloading quotations
- Real PDF generation (uses the browser print dialog)
- Motor-starting surge checks, simultaneous-load / demand-factor input
- PV series/parallel string validation (Voc, Vmp, MPPT limits, cold-temperature checks)
- Cable sizing and voltage drop
- Breaker / fuse / protection selection, earthing and SPD checklist
- Component database with exact models, datasheets and verification status
- Tax, logistics costs, company branding, payment terms, warranty text
- Location-specific solar resource data (a single 5 PSH default is used)

## Known simplifications (from the brief — review before the full version)

- All connected loads are assumed to run together (basic mode).
- Battery units are counted by energy (lithium, 5.12 kWh of 51.2 V 100 Ah) or by Ah (tubular, 12 V 220 Ah) even when the
  system voltage is 24 V. A real design must use batteries whose voltage matches the inverter and respect BMS rules.
- Backup time uses the *installed* battery energy and the average load, so it can be longer than the hours requested.
- Prices are demo placeholders. The guides give: 10 kVA inverter, lithium battery, 620 W panel, DC protection, cables,
  mounting and labour. Other inverter sizes, the 550 W panel and the tubular battery prices are invented placeholders.
- Markup is applied to cost (not gross margin). Taxes are excluded.
