"use client";

import { fmt, formatNaira } from "@/lib/format";
import { PRICE_DATE_STAMP } from "@/lib/data";
import type { CostSummary, CustomerDetails, DesignChoices, SystemDesign } from "@/lib/types";
import NumberInput from "./NumberInput";
import QuotationPreview from "./QuotationPreview";

interface Props {
  design: SystemDesign | null;
  choices: DesignChoices;
  customer: CustomerDetails;
  cost: CostSummary | null;
  markupEnabled: boolean;
  setMarkupEnabled: (v: boolean) => void;
  markupPercent: number;
  setMarkupPercent: (n: number) => void;
  priceOverrides: Record<string, number>;
  setPriceOverrides: (o: Record<string, number>) => void;
}

export default function StepQuotation({
  design,
  choices,
  customer,
  cost,
  markupEnabled,
  setMarkupEnabled,
  markupPercent,
  setMarkupPercent,
  priceOverrides,
  setPriceOverrides,
}: Props) {
  if (!design || !cost) {
    return (
      <section className="card text-center">
        <p className="text-lg font-black">No design to price yet</p>
        <p className="text-ink/70">Fix the messages above and your costs will appear here.</p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="card no-print">
        <h2 className="mb-1 text-xl font-black">Itemised cost</h2>
        <p className="mb-3 text-xs text-ink/60">{PRICE_DATE_STAMP}. Unit prices are editable.</p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-ink/20 text-left text-xs uppercase tracking-wide text-ink/70">
                <th className="py-2">Item</th>
                <th className="py-2 text-right">Qty</th>
                <th className="w-40 py-2 text-right">Unit price (₦)</th>
                <th className="py-2 text-right">Line total</th>
              </tr>
            </thead>
            <tbody>
              {cost.lines.map((l) => (
                <tr key={l.id} className="border-b border-ink/10">
                  <td className="py-2 pr-2 font-semibold">{l.description}</td>
                  <td className="py-2 text-right">{l.quantity}</td>
                  <td className="py-2 pl-2">
                    <NumberInput
                      ariaLabel={`${l.description} unit price`}
                      value={l.unitPrice}
                      onChange={(n) => setPriceOverrides({ ...priceOverrides, [l.id]: n })}
                      className="text-right"
                    />
                  </td>
                  <td className="py-2 text-right font-extrabold">{formatNaira(l.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:items-end">
          <div className="space-y-2">
            <label className="flex items-center gap-3 font-extrabold">
              <input
                type="checkbox"
                className="h-5 w-5 accent-ink"
                checked={markupEnabled}
                onChange={(e) => setMarkupEnabled(e.target.checked)}
              />
              Apply markup
            </label>
            <div className="flex items-center gap-2">
              <div className="w-28">
                <NumberInput ariaLabel="Markup percent" value={markupPercent} onChange={setMarkupPercent} />
              </div>
              <span className="font-bold">%</span>
              <span className="text-xs text-ink/60">Markup on cost (not gross margin)</span>
            </div>
          </div>

          <dl className="space-y-1 text-right">
            <div className="flex justify-between gap-4"><dt className="text-ink/70">Subtotal</dt><dd className="font-bold">{formatNaira(cost.subtotal)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink/70">Markup ({fmt(cost.markupRate * 100, 1)} %)</dt><dd className="font-bold">{formatNaira(cost.markupAmount)}</dd></div>
            <div className="rounded-2xl bg-accent px-4 py-3 text-ink">
              <dt className="text-xs font-extrabold uppercase tracking-wide">Grand total</dt>
              <dd className="text-3xl font-black">{formatNaira(cost.grandTotal)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Quotation preview</h2>
        <button type="button" className="btn-accent" onClick={() => window.print()}>
          🖨️ Print / Save as PDF
        </button>
      </div>

      <QuotationPreview customer={customer} design={design} choices={choices} cost={cost} hours={choices.backupHours} />
    </div>
  );
}
