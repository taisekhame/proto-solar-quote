"use client";

import { DEFAULT_ASSUMPTIONS, DEFAULT_CHOICES } from "@/lib/calculations";
import { BACKUP_HOUR_OPTIONS, PANEL_WATT_OPTIONS } from "@/lib/data";
import type { Assumptions, BatteryType, DesignChoices } from "@/lib/types";
import NumberInput from "./NumberInput";
import Placeholder from "./Placeholder";

interface Props {
  choices: DesignChoices;
  setChoices: (c: DesignChoices) => void;
  assumptions: Assumptions;
  setAssumptions: (a: Assumptions) => void;
}

const ADVANCED: { key: keyof Assumptions; label: string; step: string; hint: string }[] = [
  { key: "peakSunHours", label: "Peak sun hours (h/day)", step: "0.1", hint: "Default 5" },
  { key: "performanceRatio", label: "Performance ratio", step: "0.01", hint: "Default 0.75" },
  { key: "powerFactor", label: "Power factor", step: "0.01", hint: "Default 0.8" },
  { key: "designMargin", label: "Design margin", step: "0.05", hint: "Default 1.25" },
  { key: "inverterEfficiency", label: "Inverter efficiency", step: "0.01", hint: "Default 0.93" },
  { key: "batteryEfficiency", label: "Battery efficiency", step: "0.01", hint: "Default 0.95" },
];

export default function StepDesign({ choices, setChoices, assumptions, setAssumptions }: Props) {
  return (
    <div className="space-y-5">
      <section className="card">
        <h2 className="mb-3 text-xl font-black">Your choices</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="backup">Backup hours</label>
            <select
              id="backup"
              className="field"
              value={choices.backupHours}
              onChange={(e) => setChoices({ ...choices, backupHours: Number(e.target.value) })}
            >
              {BACKUP_HOUR_OPTIONS.map((h) => (
                <option key={h} value={h}>{h} hours</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="battery-type">Battery type</label>
            <select
              id="battery-type"
              className="field"
              value={choices.batteryType}
              onChange={(e) => setChoices({ ...choices, batteryType: e.target.value as BatteryType })}
            >
              <option value="lithium">Lithium LiFePO4</option>
              <option value="tubular">Tubular Lead-Acid</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="panel">Panel wattage</label>
            <select
              id="panel"
              className="field"
              value={choices.panelWatts}
              onChange={(e) => setChoices({ ...choices, panelWatts: Number(e.target.value) })}
            >
              {PANEL_WATT_OPTIONS.map((w) => (
                <option key={w} value={w}>{w} W</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-black">Advanced assumptions</h2>
          <button
            type="button"
            className="btn-ghost !py-1.5 text-sm"
            onClick={() => {
              setAssumptions(DEFAULT_ASSUMPTIONS);
              setChoices(DEFAULT_CHOICES);
            }}
          >
            Reset to defaults
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ADVANCED.map((f) => (
            <div key={f.key}>
              <span className="label">{f.label}</span>
              <NumberInput
                ariaLabel={f.label}
                step={f.step}
                value={assumptions[f.key]}
                onChange={(n) => setAssumptions({ ...assumptions, [f.key]: n })}
              />
              <span className="mt-0.5 block text-xs text-ink/50">{f.hint}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <label className="flex cursor-not-allowed items-center gap-3 opacity-70">
          <input type="checkbox" disabled className="h-5 w-10 cursor-not-allowed accent-ink" aria-label="Professional Mode (disabled)" />
          <span className="font-extrabold">Professional Mode — coming in full version</span>
        </label>
        <Placeholder>surge checks, PV string validation, cable sizing and breaker/protection selection.</Placeholder>
      </section>
    </div>
  );
}
