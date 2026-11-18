"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Issues from "@/components/Issues";
import StepDesign from "@/components/StepDesign";
import StepLoadAudit from "@/components/StepLoadAudit";
import StepQuotation from "@/components/StepQuotation";
import StepResults from "@/components/StepResults";
import Stepper, { STEP_LABELS } from "@/components/Stepper";
import {
  DEFAULT_ASSUMPTIONS,
  DEFAULT_CHOICES,
  buildCostLines,
  calcCost,
  calcLoadAudit,
  calcSystemDesign,
  hasErrors,
  validateInputs,
} from "@/lib/calculations";
import { DEFAULT_MARKUP_PERCENT, DEMO_APPLIANCES, EMPTY_CUSTOMER, PRICE_BOOK } from "@/lib/data";
import type { Appliance, Assumptions, CustomerDetails, DesignChoices } from "@/lib/types";

export default function QuotePage() {
  // ---- All state lives here; every derived number is recomputed live below. ----
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<CustomerDetails>(EMPTY_CUSTOMER);
  const [appliances, setAppliances] = useState<Appliance[]>(DEMO_APPLIANCES);
  const [choices, setChoices] = useState<DesignChoices>(DEFAULT_CHOICES);
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const [markupEnabled, setMarkupEnabled] = useState(true);
  const [markupPercent, setMarkupPercent] = useState(DEFAULT_MARKUP_PERCENT);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});

  const issues = useMemo(() => validateInputs(appliances, assumptions, choices), [appliances, assumptions, choices]);
  const load = useMemo(() => calcLoadAudit(appliances), [appliances]);
  const design = useMemo(() => calcSystemDesign(appliances, choices, assumptions), [appliances, choices, assumptions]);
  const cost = useMemo(
    () =>
      design
        ? calcCost(buildCostLines(design, choices, PRICE_BOOK, priceOverrides), markupEnabled ? markupPercent / 100 : 0)
        : null,
    [design, choices, priceOverrides, markupEnabled, markupPercent],
  );

  const blocked = hasErrors(issues) || !design;
  const maxReachable = blocked ? 0 : STEP_LABELS.length - 1;
  const goTo = (i: number) => setStep(Math.max(0, Math.min(i, maxReachable)));

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6">
      <header className="no-print flex items-center justify-between">
        <Link href="/" className="text-lg font-black">☀️ SunSizer</Link>
        <span className="rounded-full bg-grape px-3 py-1 text-xs font-extrabold text-sun">Prototype</span>
      </header>

      <Stepper current={step} maxReachable={maxReachable} onSelect={goTo} />

      <Issues issues={issues} />

      <div className="flex-1">
        {step === 0 && (
          <StepLoadAudit
            customer={customer}
            setCustomer={setCustomer}
            appliances={appliances}
            setAppliances={setAppliances}
            load={load}
          />
        )}
        {step === 1 && (
          <StepDesign choices={choices} setChoices={setChoices} assumptions={assumptions} setAssumptions={setAssumptions} />
        )}
        {step === 2 && <StepResults design={design} choices={choices} />}
        {step === 3 && (
          <StepQuotation
            design={design}
            choices={choices}
            customer={customer}
            cost={cost}
            markupEnabled={markupEnabled}
            setMarkupEnabled={setMarkupEnabled}
            markupPercent={markupPercent}
            setMarkupPercent={setMarkupPercent}
            priceOverrides={priceOverrides}
            setPriceOverrides={setPriceOverrides}
          />
        )}
      </div>

      <footer className="no-print flex items-center justify-between gap-3 rounded-3xl bg-grape p-3 shadow-soft">
        <button type="button" className="btn-ghost" disabled={step === 0} onClick={() => goTo(step - 1)}>
          ← Back
        </button>
        <span className="hidden text-sm font-bold text-white/70 sm:block">
          Step {step + 1} of {STEP_LABELS.length}: {STEP_LABELS[step]}
        </span>
        {step < STEP_LABELS.length - 1 ? (
          <button type="button" className="btn-sun" disabled={blocked} onClick={() => goTo(step + 1)}>
            Next →
          </button>
        ) : (
          <button type="button" className="btn-ghost" onClick={() => goTo(0)}>
            Back to Step 1 ↺
          </button>
        )}
      </footer>
    </main>
  );
}
