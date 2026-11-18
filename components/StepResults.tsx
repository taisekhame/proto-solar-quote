import { fmt } from "@/lib/format";
import type { DesignChoices, SystemDesign } from "@/lib/types";
import Placeholder from "./Placeholder";

interface Props {
  design: SystemDesign | null;
  choices: DesignChoices;
}

function ResultCard({
  icon,
  title,
  big,
  rows,
  note,
}: {
  icon: string;
  title: string;
  big: string;
  rows: [string, string][];
  note?: string;
}) {
  return (
    <section className="card flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden>{icon}</span>
        <h3 className="text-lg font-black leading-tight">{title}</h3>
      </div>
      <p className="rounded-2xl bg-sun px-4 py-2 text-3xl font-black text-black">{big}</p>
      <dl className="space-y-1 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-white/10 pb-1">
            <dt className="text-white/70">{k}</dt>
            <dd className="text-right font-extrabold">{v}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="text-xs text-white/60">{note}</p>}
    </section>
  );
}

export default function StepResults({ design, choices }: Props) {
  if (!design) {
    return (
      <section className="card text-center">
        <p className="text-lg font-black">Nothing to size yet</p>
        <p className="text-white/70">Fix the messages above (go back to Load Audit or Design Choices) and your results will appear here.</p>
      </section>
    );
  }

  const { inverter, battery, pv, backupTimeHours, mpptChargingCurrentA } = design;
  const isLithium = choices.batteryType === "lithium";

  return (
    <div className="space-y-5">
      {inverter.exceedsLargestSize && (
        <p className="rounded-2xl bg-sun px-4 py-2 text-sm font-bold text-black" role="alert">
          ⚠️ The load needs {fmt(inverter.requiredKva, 2)} kVA, which is more than the largest standard size (30 kVA). Showing 30 kVA — a multi-inverter or custom design is needed.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ResultCard
          icon="🔌"
          title="Recommended Inverter"
          big={`${fmt(inverter.recommendedKva, 1)} kVA`}
          rows={[
            ["Real power rating", `${fmt(inverter.recommendedKw, 2)} kW`],
            ["Required (load × margin)", `${fmt(inverter.requiredKw, 2)} kW`],
            ["Required apparent power", `${fmt(inverter.requiredKva, 2)} kVA`],
          ]}
          note="Basic mode assumes all loads run together. Motor surge is not checked."
        />

        <ResultCard
          icon="🔋"
          title="Battery Bank"
          big={`${battery.numberOfBatteries} × ${isLithium ? "Lithium" : "Tubular"}`}
          rows={[
            ["Required energy", `${fmt(battery.requiredKwh, 2)} kWh`],
            ["Required capacity", `${fmt(battery.requiredAh, 0)} Ah`],
            ["System voltage", `${battery.systemVoltage} V`],
            ["Number of batteries", `${battery.numberOfBatteries}`],
            ["Installed energy", `${fmt(battery.installedKwh, 2)} kWh`],
            ["Depth of discharge", `${fmt(battery.dod * 100)} %`],
          ]}
          note={`${battery.description}. Prototype simplification: units are counted by energy or Ah — real designs must match battery voltage and BMS rules.`}
        />

        <ResultCard
          icon="☀️"
          title="Solar Array"
          big={`${pv.numberOfPanels} × ${choices.panelWatts} W`}
          rows={[
            ["Required", `${fmt(pv.requiredKwp, 2)} kWp`],
            ["Installed", `${fmt(pv.installedKwp, 2)} kWp`],
            ["Number of panels", `${pv.numberOfPanels}`],
          ]}
          note="Series/parallel string layout is not validated in this prototype."
        />

        <ResultCard
          icon="⏱️"
          title="Estimated Backup Time"
          big={`${fmt(backupTimeHours, 1)} hours`}
          rows={[
            ["You asked for", `${choices.backupHours} hours`],
            ["Based on average load", `${fmt(design.load.averagePowerW, 0)} W`],
          ]}
          note="Uses installed battery energy, so it can exceed the hours requested."
        />

        <ResultCard
          icon="🚦"
          title="Approx. MPPT Charging Current"
          big={`${fmt(mpptChargingCurrentA, 1)} A`}
          rows={[
            ["Installed PV", `${fmt(pv.installedWatts)} W`],
            ["MPPT efficiency", "98 %"],
            ["At system voltage", `${battery.systemVoltage} V`],
          ]}
          note="Not yet checked against inverter or battery charge limits."
        />
      </div>

      <Placeholder>PV string validation, cable sizing and breaker/protection selection.</Placeholder>
    </div>
  );
}
