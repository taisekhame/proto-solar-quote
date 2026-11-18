"use client";

import { APPLIANCE_PRESETS, CUSTOM_PRESET } from "@/lib/data";
import { fmt } from "@/lib/format";
import type { Appliance, CustomerDetails, LoadAudit } from "@/lib/types";
import NumberInput from "./NumberInput";

interface Props {
  customer: CustomerDetails;
  setCustomer: (c: CustomerDetails) => void;
  appliances: Appliance[];
  setAppliances: (a: Appliance[]) => void;
  load: LoadAudit;
}

let counter = 0;
const newId = () => `row-${Date.now()}-${counter++}`;

export default function StepLoadAudit({ customer, setCustomer, appliances, setAppliances, load }: Props) {
  const update = (id: string, patch: Partial<Appliance>) =>
    setAppliances(appliances.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const changePreset = (id: string, preset: string) => {
    if (preset === CUSTOM_PRESET) {
      update(id, { preset, name: "" });
      return;
    }
    const p = APPLIANCE_PRESETS.find((x) => x.name === preset);
    if (p) update(id, { preset, name: p.name, watts: p.watts, hoursPerDay: p.hours });
  };

  const addRow = () =>
    setAppliances([
      ...appliances,
      { id: newId(), preset: CUSTOM_PRESET, name: "", quantity: 1, watts: 100, hoursPerDay: 4 },
    ]);

  const deleteRow = (id: string) => setAppliances(appliances.filter((a) => a.id !== id));

  return (
    <div className="space-y-5">
      {/* Customer details (optional) */}
      <section className="card">
        <h2 className="mb-3 text-xl font-black">Customer details <span className="text-sm font-semibold text-white/60">(optional)</span></h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="c-name">Name</label>
            <input id="c-name" className="field" value={customer.name} placeholder="e.g. Mr. Okafor" onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="c-phone">Phone</label>
            <input id="c-phone" className="field" inputMode="tel" value={customer.phone} placeholder="e.g. 0803 000 0000" onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="c-address">Address</label>
            <input id="c-address" className="field" value={customer.address} placeholder="Installation address" onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
          </div>
        </div>
      </section>

      {/* Appliance table */}
      <section className="card">
        <h2 className="mb-3 text-xl font-black">Appliances</h2>

        <div className="hidden grid-cols-[1.6fr_0.6fr_0.8fr_0.8fr_auto] gap-2 px-1 pb-1 text-xs font-bold uppercase tracking-wide text-white/70 md:grid">
          <span>Appliance</span>
          <span>Qty</span>
          <span>Watts (each)</span>
          <span>Hours / day</span>
          <span className="w-10" />
        </div>

        <div className="space-y-3">
          {appliances.map((a, i) => (
            <div
              key={a.id}
              className="grid grid-cols-3 items-end gap-2 rounded-2xl bg-white/5 p-3 md:grid-cols-[1.6fr_0.6fr_0.8fr_0.8fr_auto] md:bg-transparent md:p-0"
            >
              <div className="col-span-3 space-y-2 md:col-span-1">
                <select
                  aria-label={`Appliance ${i + 1} preset`}
                  className="field"
                  value={a.preset}
                  onChange={(e) => changePreset(a.id, e.target.value)}
                >
                  {APPLIANCE_PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                  <option value={CUSTOM_PRESET}>Custom…</option>
                </select>
                {a.preset === CUSTOM_PRESET && (
                  <input
                    aria-label={`Appliance ${i + 1} custom name`}
                    className="field"
                    placeholder="Appliance name"
                    value={a.name}
                    onChange={(e) => update(a.id, { name: e.target.value })}
                  />
                )}
              </div>
              <div>
                <span className="label md:hidden">Qty</span>
                <NumberInput ariaLabel={`Appliance ${i + 1} quantity`} value={a.quantity} onChange={(n) => update(a.id, { quantity: n })} />
              </div>
              <div>
                <span className="label md:hidden">Watts</span>
                <NumberInput ariaLabel={`Appliance ${i + 1} watts`} value={a.watts} onChange={(n) => update(a.id, { watts: n })} />
              </div>
              <div>
                <span className="label md:hidden">Hours/day</span>
                <NumberInput ariaLabel={`Appliance ${i + 1} hours per day`} value={a.hoursPerDay} onChange={(n) => update(a.id, { hoursPerDay: n })} />
              </div>
              <button
                type="button"
                onClick={() => deleteRow(a.id)}
                aria-label={`Delete appliance ${i + 1}`}
                className="h-10 w-10 justify-self-end rounded-full bg-white/10 text-lg font-black transition hover:bg-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addRow} className="btn-sun mt-4 !py-2">
          ＋ Add appliance
        </button>
      </section>

      {/* Running totals */}
      <section className="grid gap-3 sm:grid-cols-3" aria-live="polite">
        <Total label="Total Connected Load" value={`${fmt(load.connectedLoadW)} W`} />
        <Total label="Daily Energy" value={`${fmt(load.dailyEnergyWh)} Wh`} />
        <Total label="Daily Energy" value={`${fmt(load.dailyEnergyKwh, 2)} kWh/day`} />
      </section>
    </div>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-sun p-4 text-black shadow-soft">
      <p className="text-xs font-extrabold uppercase tracking-wide text-black/70">{label}</p>
      <p className="text-2xl font-black sm:text-3xl">{value}</p>
    </div>
  );
}
