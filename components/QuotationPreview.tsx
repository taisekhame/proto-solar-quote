"use client";

import { fmt, formatNaira } from "@/lib/format";
import type { CostSummary, CustomerDetails, DesignChoices, SystemDesign } from "@/lib/types";

interface Props {
  customer: CustomerDetails;
  design: SystemDesign;
  choices: DesignChoices;
  cost: CostSummary;
  hours: number;
}

/** Clean white document; this is the only thing that prints. */
export default function QuotationPreview({ customer, design, choices, cost }: Props) {
  const { load, inverter, battery, pv } = design;
  return (
    <article id="quotation-preview" className="rounded-3xl border border-ink/15 bg-paper p-5 text-ink shadow-soft print:bg-white sm:p-8">
      <header className="-mx-5 -mt-5 flex flex-wrap items-start justify-between gap-3 rounded-t-3xl border-b-4 border-accent bg-ink px-5 py-4 text-cream print:mx-0 print:mt-0 print:rounded-none print:bg-white print:px-0 print:text-ink sm:-mx-8 sm:-mt-8 sm:px-8">
        <div>
          <h2 className="text-2xl font-black sm:text-3xl">☀️ SunSizer Quotation</h2>
          <p className="text-sm text-cream/70 print:text-ink/70">Solar PV system — preliminary estimate</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-extrabold">Quotation no: QT-DEMO-001</p>
          <p suppressHydrationWarning>Date: {new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</p>
          <p>Valid for: [placeholder] days</p>
        </div>
      </header>

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-1 text-sm font-black uppercase tracking-wide text-ink/60">Customer</h3>
          <p className="font-bold">{customer.name || "—"}</p>
          <p>{customer.phone || "—"}</p>
          <p>{customer.address || "—"}</p>
        </div>
        <div>
          <h3 className="mb-1 text-sm font-black uppercase tracking-wide text-ink/60">Load summary</h3>
          <p>Connected load: <strong>{fmt(load.connectedLoadW)} W</strong></p>
          <p>Daily energy: <strong>{fmt(load.dailyEnergyKwh, 2)} kWh/day</strong></p>
        </div>
      </section>

      <section className="mt-5">
        <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-ink/60">System design</h3>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          <li className="rounded-xl bg-ink/5 p-3">🔌 Inverter: <strong>{fmt(inverter.recommendedKva, 1)} kVA</strong> ({fmt(inverter.recommendedKw, 2)} kW)</li>
          <li className="rounded-xl bg-ink/5 p-3">🔋 Battery: <strong>{battery.description}</strong> — {fmt(battery.installedKwh, 2)} kWh at {battery.systemVoltage} V</li>
          <li className="rounded-xl bg-ink/5 p-3">☀️ Solar: <strong>{pv.numberOfPanels} × {choices.panelWatts} W</strong> = {fmt(pv.installedKwp, 2)} kWp</li>
          <li className="rounded-xl bg-ink/5 p-3">⏱️ Est. backup: <strong>{fmt(design.backupTimeHours, 1)} h</strong> · MPPT ≈ {fmt(design.mpptChargingCurrentA, 0)} A</li>
        </ul>
      </section>

      <section className="mt-5 overflow-x-auto">
        <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-ink/60">Costs</h3>
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b-2 border-ink text-left">
              <th className="py-1">Item</th>
              <th className="py-1 text-right">Qty</th>
              <th className="py-1 text-right">Unit price</th>
              <th className="py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {cost.lines.map((l) => (
              <tr key={l.id} className="border-b border-ink/10">
                <td className="py-1.5">{l.description}</td>
                <td className="py-1.5 text-right">{l.quantity}</td>
                <td className="py-1.5 text-right">{formatNaira(l.unitPrice)}</td>
                <td className="py-1.5 text-right font-semibold">{formatNaira(l.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="pt-2 text-right">Subtotal</td>
              <td className="pt-2 text-right">{formatNaira(cost.subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="text-right">Markup ({fmt(cost.markupRate * 100, 1)} %)</td>
              <td className="text-right">{formatNaira(cost.markupAmount)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="pt-2 text-right text-base font-black">Grand total</td>
              <td className="pt-2 text-right">
                <span className="rounded-lg bg-accent px-2 py-1 text-base font-black">{formatNaira(cost.grandTotal)}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <footer className="mt-5 space-y-1 border-t border-ink/15 pt-3 text-xs text-ink/60">
        <p>Demo placeholder prices — not verified market prices. Taxes not included. Preliminary estimate only; not a verified engineering design.</p>
        <p>[Placeholder] Company logo/address · payment terms · warranty · exclusions · signature (full version).</p>
      </footer>
    </article>
  );
}
