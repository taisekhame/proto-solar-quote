// =============================================================================
// Solar PV calculation engine — PURE FUNCTIONS ONLY (no React, no I/O).
//
// Formulas follow the two attached engineering guides:
//   [G1] "Solar PV System Sizing and Quotation Engineering Guide"
//   [G2] "Solar PV Sizing & Quotation Software — Engineering Framework"
// and the prototype brief. Every function lists its formula above it.
//
// NOTE: this file intentionally imports TYPES ONLY, so it can also be run
// directly by `npm run verify` (Node type-stripping) without a bundler.
// =============================================================================

import type {
  Appliance,
  Assumptions,
  BatteryResult,
  BatteryType,
  CostLine,
  CostSummary,
  DesignChoices,
  InverterResult,
  LoadAudit,
  PriceBook,
  PvResult,
  SystemDesign,
  ValidationIssue,
} from "./types";

// ----------------------------------------------------------------------------
// Engine constants
// ----------------------------------------------------------------------------

/** Standard inverter sizes in kVA (brief, Step 3). */
export const STANDARD_INVERTER_KVA = [1.5, 2.5, 3.5, 5, 6, 7.5, 10, 15, 20, 30] as const;

/** Depth of discharge by chemistry [G1 §5 table]. */
export const DOD: Record<BatteryType, number> = { lithium: 0.8, tubular: 0.5 };

/** One lithium unit: 51.2 V x 100 Ah = 5.12 kWh [G1 §4 Formula 7]. */
export const LITHIUM_UNIT = { voltage: 51.2, ah: 100, kwh: 5.12 } as const;

/** One tubular lead-acid unit: 12 V x 220 Ah [G1 §5]. */
export const TUBULAR_UNIT = { voltage: 12, ah: 220 } as const;

/** MPPT conversion efficiency [G1 §8 Formula 13]. */
export const MPPT_EFFICIENCY = 0.98;

/** Systems with inverter <= 3.5 kVA use 24 V, larger use 48 V (brief). */
export const SMALL_SYSTEM_MAX_KVA = 3.5;

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  peakSunHours: 5,
  performanceRatio: 0.75,
  powerFactor: 0.8,
  designMargin: 1.25,
  inverterEfficiency: 0.93,
  batteryEfficiency: 0.95,
};

export const DEFAULT_CHOICES: DesignChoices = {
  backupHours: 8,
  batteryType: "lithium",
  panelWatts: 620,
};

// Small helper: guards float noise such as 4.000000001 -> 5 when rounding up.
const ceilSafe = (x: number): number => Math.ceil(Math.round(x * 1e9) / 1e9);

// ----------------------------------------------------------------------------
// Validation
// ----------------------------------------------------------------------------

/** A row counts toward the maths only if all three numbers are > 0. */
export function isValidAppliance(a: Appliance): boolean {
  return a.quantity > 0 && a.watts > 0 && a.hoursPerDay > 0;
}

/**
 * Basic validation [G2 Part 17]:
 *  - reject zero/negative quantity, watts, hours (error)
 *  - warn when hours > 24 (warning, still calculated)
 *  - reject zero/negative design assumptions and choices (error)
 */
export function validateInputs(
  appliances: Appliance[],
  assumptions: Assumptions,
  choices: DesignChoices,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (appliances.length === 0) {
    issues.push({ level: "error", message: "Add at least one appliance to start sizing." });
  }

  appliances.forEach((a, i) => {
    const label = a.name.trim() || `Row ${i + 1}`;
    if (!(a.quantity > 0)) issues.push({ level: "error", message: `${label}: quantity must be greater than zero.` });
    if (!(a.watts > 0)) issues.push({ level: "error", message: `${label}: watts must be greater than zero.` });
    if (!(a.hoursPerDay > 0)) issues.push({ level: "error", message: `${label}: hours per day must be greater than zero.` });
    if (a.hoursPerDay > 24) {
      issues.push({
        level: "warning",
        message: `${label}: ${a.hoursPerDay} hours per day is more than 24. Check this is intended (e.g. multiple shifts).`,
      });
    }
  });

  const assumptionLabels: Record<keyof Assumptions, string> = {
    peakSunHours: "Peak sun hours",
    performanceRatio: "Performance ratio",
    powerFactor: "Power factor",
    designMargin: "Design margin",
    inverterEfficiency: "Inverter efficiency",
    batteryEfficiency: "Battery efficiency",
  };
  (Object.keys(assumptionLabels) as (keyof Assumptions)[]).forEach((k) => {
    if (!(assumptions[k] > 0)) {
      issues.push({ level: "error", message: `${assumptionLabels[k]} must be greater than zero.` });
    }
  });
  if (assumptions.performanceRatio > 1) issues.push({ level: "error", message: "Performance ratio cannot be more than 1." });
  if (assumptions.powerFactor > 1) issues.push({ level: "error", message: "Power factor cannot be more than 1." });
  if (assumptions.inverterEfficiency > 1) issues.push({ level: "error", message: "Inverter efficiency cannot be more than 1." });
  if (assumptions.batteryEfficiency > 1) issues.push({ level: "error", message: "Battery efficiency cannot be more than 1." });

  if (!(choices.backupHours > 0)) issues.push({ level: "error", message: "Backup hours must be greater than zero." });
  if (!(choices.panelWatts > 0)) issues.push({ level: "error", message: "Panel wattage must be greater than zero." });

  return issues;
}

export const hasErrors = (issues: ValidationIssue[]): boolean => issues.some((i) => i.level === "error");

// ----------------------------------------------------------------------------
// Step 1 — Load audit
// ----------------------------------------------------------------------------

/**
 * Formula 1 [G1 §2, G2 1.1]  P_connected (W) = Σ (Quantity_i × Power_i)
 * Formula 2 [G1 §2, G2 1.2]  E_daily  (Wh)   = Σ (Quantity_i × Power_i × Hours_i)
 *                            E_daily  (kWh)  = E_daily (Wh) ÷ 1000
 * Formula 2b [G2 1.3]        P_average (W)   = E_daily (Wh) ÷ 24
 *
 * Only valid rows (all values > 0) are counted.
 */
export function calcLoadAudit(appliances: Appliance[]): LoadAudit {
  const rows = appliances.filter(isValidAppliance);
  const connectedLoadW = rows.reduce((sum, a) => sum + a.quantity * a.watts, 0);
  const dailyEnergyWh = rows.reduce((sum, a) => sum + a.quantity * a.watts * a.hoursPerDay, 0);
  return {
    connectedLoadW,
    dailyEnergyWh,
    dailyEnergyKwh: dailyEnergyWh / 1000,
    averagePowerW: dailyEnergyWh / 24,
  };
}

// ----------------------------------------------------------------------------
// Step 3 — Inverter
// ----------------------------------------------------------------------------

/** Round a kVA requirement UP to the nearest standard size. */
export function roundUpToStandardKva(kva: number): { size: number; exceeds: boolean } {
  const found = STANDARD_INVERTER_KVA.find((s) => s >= kva - 1e-9);
  if (found !== undefined) return { size: found, exceeds: false };
  // Beyond the list: keep the largest size and flag it.
  return { size: STANDARD_INVERTER_KVA[STANDARD_INVERTER_KVA.length - 1], exceeds: true };
}

/**
 * Formula 3 [G1 §3]  P_inv,prelim (kW) = P_connected × SF       (SF = design margin, 1.25)
 *   Basic mode assumes ALL connected loads can run together, so
 *   P_max,simultaneous = P_connected.
 * Formula 4 [G1 §3]  S (kVA) = P (kW) ÷ PF                     (PF = 0.8)
 * Recommendation     = smallest standard kVA size >= S.
 * Recommended kW     = recommended kVA × PF (real power the chosen size can deliver).
 */
export function calcInverter(load: LoadAudit, a: Assumptions): InverterResult {
  const requiredKw = (load.connectedLoadW * a.designMargin) / 1000;
  const requiredKva = requiredKw / a.powerFactor;
  const { size, exceeds } = roundUpToStandardKva(requiredKva);
  return {
    requiredKw,
    requiredKva,
    recommendedKva: size,
    recommendedKw: size * a.powerFactor,
    exceedsLargestSize: exceeds,
  };
}

// ----------------------------------------------------------------------------
// Step 3 — Battery bank
// ----------------------------------------------------------------------------

/** System DC voltage: 24 V when inverter <= 3.5 kVA, otherwise 48 V (brief). */
export function systemVoltageFor(recommendedKva: number): number {
  return recommendedKva <= SMALL_SYSTEM_MAX_KVA ? 24 : 48;
}

/**
 * Formula 5 [G1 §4, G2 3.1]
 *   E_battery,nominal (Wh) = (P_average × T_backup) ÷ (DoD × η_inv × η_bat)
 * Formula 6 [G1 §4]
 *   Ah = E_battery,nominal (Wh) ÷ V_system
 * Formula 7 [G1 §4]  LITHIUM
 *   N = ceil( required kWh ÷ 5.12 kWh )            (one 51.2 V 100 Ah unit)
 * Formula 7b [G2 3.3] TUBULAR (one battery = 12 V 220 Ah)
 *   Ns = V_system ÷ 12
 *   Np = ceil( required Ah ÷ 220 )
 *   N  = Ns × Np
 */
export function calcBattery(
  load: LoadAudit,
  inverter: InverterResult,
  choices: DesignChoices,
  a: Assumptions,
): BatteryResult {
  const dod = DOD[choices.batteryType];
  const requiredWh = (load.averagePowerW * choices.backupHours) / (dod * a.inverterEfficiency * a.batteryEfficiency);
  const systemVoltage = systemVoltageFor(inverter.recommendedKva);
  const requiredAh = requiredWh / systemVoltage;

  if (choices.batteryType === "lithium") {
    const n = Math.max(1, ceilSafe(requiredWh / 1000 / LITHIUM_UNIT.kwh));
    const installedKwh = n * LITHIUM_UNIT.kwh;
    return {
      dod,
      requiredWh,
      requiredKwh: requiredWh / 1000,
      systemVoltage,
      requiredAh,
      numberOfBatteries: n,
      seriesCount: 1,
      parallelCount: n,
      installedWh: installedKwh * 1000,
      installedKwh,
      description: `${n} × 51.2V 100Ah LiFePO4 (${LITHIUM_UNIT.kwh} kWh each)`,
    };
  }

  const series = Math.max(1, ceilSafe(systemVoltage / TUBULAR_UNIT.voltage));
  const parallel = Math.max(1, ceilSafe(requiredAh / TUBULAR_UNIT.ah));
  const n = series * parallel;
  // Installed nominal energy = units × 12 V × 220 Ah  (G1 §5: 48 V × 220 Ah = 10.56 kWh per string)
  const installedWh = n * TUBULAR_UNIT.voltage * TUBULAR_UNIT.ah;
  return {
    dod,
    requiredWh,
    requiredKwh: requiredWh / 1000,
    systemVoltage,
    requiredAh,
    numberOfBatteries: n,
    seriesCount: series,
    parallelCount: parallel,
    installedWh,
    installedKwh: installedWh / 1000,
    description: `${n} × 12V 220Ah tubular (${series} in series × ${parallel} parallel)`,
  };
}

// ----------------------------------------------------------------------------
// Step 3 — PV array
// ----------------------------------------------------------------------------

/**
 * Formula 8 [G1 §6, G2 5.2]  P_PV (kWp) = E_daily (kWh/day) ÷ (PSH × PR)
 * Formula 9 [G1 §6, G2 5.3]  N_panels = ceil( P_required (W) ÷ P_panel (W) )
 *                            Installed (W) = N_panels × P_panel
 */
export function calcPv(load: LoadAudit, choices: DesignChoices, a: Assumptions): PvResult {
  const requiredKwp = load.dailyEnergyKwh / (a.peakSunHours * a.performanceRatio);
  const requiredWatts = requiredKwp * 1000;
  const numberOfPanels = Math.max(1, ceilSafe(requiredWatts / choices.panelWatts));
  const installedWatts = numberOfPanels * choices.panelWatts;
  return {
    requiredKwp,
    requiredWatts,
    numberOfPanels,
    installedWatts,
    installedKwp: installedWatts / 1000,
  };
}

// ----------------------------------------------------------------------------
// Step 3 — Backup time and MPPT current
// ----------------------------------------------------------------------------

/**
 * Formula 14 [G1 §9, G2 Part 4]
 *   T (h) = (E_installed,nominal × DoD × η_bat × η_inv) ÷ P_load
 * P_load here = average power (Wh/day ÷ 24), per the brief.
 */
export function calcBackupTime(battery: BatteryResult, load: LoadAudit, a: Assumptions): number {
  if (load.averagePowerW <= 0) return 0;
  return (battery.installedWh * battery.dod * a.batteryEfficiency * a.inverterEfficiency) / load.averagePowerW;
}

/**
 * Formula 13 [G1 §8, G2 Part 7]
 *   I_charge (A) ≈ (P_PV,installed × η_MPPT) ÷ V_system       (η_MPPT = 0.98)
 */
export function calcMpptCurrent(pv: PvResult, systemVoltage: number): number {
  return (pv.installedWatts * MPPT_EFFICIENCY) / systemVoltage;
}

// ----------------------------------------------------------------------------
// Whole design in one call
// ----------------------------------------------------------------------------

/** Returns null when there is nothing valid to size yet. */
export function calcSystemDesign(
  appliances: Appliance[],
  choices: DesignChoices,
  assumptions: Assumptions,
): SystemDesign | null {
  const issues = validateInputs(appliances, assumptions, choices);
  const load = calcLoadAudit(appliances);
  if (hasErrors(issues) || load.connectedLoadW <= 0) return null;

  const inverter = calcInverter(load, assumptions);
  const battery = calcBattery(load, inverter, choices, assumptions);
  const pv = calcPv(load, choices, assumptions);
  return {
    load,
    inverter,
    battery,
    pv,
    backupTimeHours: calcBackupTime(battery, load, assumptions),
    mpptChargingCurrentA: calcMpptCurrent(pv, battery.systemVoltage),
  };
}

// ----------------------------------------------------------------------------
// Step 4 — Cost
// ----------------------------------------------------------------------------

/**
 * Turns a sized system into itemised cost lines using a price book.
 * `overrides` lets the user edit any unit price by line id.
 * Quantities come straight from the design (1 inverter, N batteries, N panels, 1 set each, 1 labour).
 */
export function buildCostLines(
  design: SystemDesign,
  choices: DesignChoices,
  prices: PriceBook,
  overrides: Record<string, number> = {},
): Omit<CostLine, "lineTotal">[] {
  const isLithium = choices.batteryType === "lithium";
  const batteryUnitPrice = isLithium ? prices.lithiumBattery : prices.tubularBattery;
  const base: Omit<CostLine, "lineTotal">[] = [
    {
      id: "inverter",
      description: `${design.inverter.recommendedKva} kVA hybrid inverter`,
      quantity: 1,
      unit: "pc",
      unitPrice: prices.inverterByKva[design.inverter.recommendedKva] ?? 0,
    },
    {
      id: "battery",
      description: isLithium ? "Lithium LiFePO4 battery 51.2V 100Ah (5.12 kWh)" : "Tubular lead-acid battery 12V 220Ah",
      quantity: design.battery.numberOfBatteries,
      unit: "pc",
      unitPrice: batteryUnitPrice,
    },
    {
      id: "panels",
      description: `${choices.panelWatts} W solar panel`,
      quantity: design.pv.numberOfPanels,
      unit: "pc",
      unitPrice: prices.panelByWatts[choices.panelWatts] ?? 0,
    },
    { id: "dc", description: "DC protection (set)", quantity: 1, unit: "set", unitPrice: prices.dcProtectionSet },
    { id: "cables", description: "Cables (set)", quantity: 1, unit: "set", unitPrice: prices.cablesSet },
    { id: "mounting", description: "Mounting materials (set)", quantity: 1, unit: "set", unitPrice: prices.mountingSet },
    { id: "labour", description: "Installation labour", quantity: 1, unit: "job", unitPrice: prices.installationLabour },
  ];
  return base.map((l) => {
    const o = overrides[l.id];
    return o !== undefined && Number.isFinite(o) && o >= 0 ? { ...l, unitPrice: o } : l;
  });
}

/**
 * Formula 17 [G1 §12, G2 13.1]  Line total = Quantity × Unit price
 *                               Cost base   = Σ line totals
 * Formula 18 [G1 §12, G2 13.3]  Selling price = Cost × (1 + Markup rate)
 *   (Markup, NOT gross margin. Taxes are not included in this prototype.)
 */
export function calcCost(lines: Omit<CostLine, "lineTotal">[], markupRate: number): CostSummary {
  const full: CostLine[] = lines.map((l) => ({ ...l, lineTotal: l.quantity * l.unitPrice }));
  const subtotal = full.reduce((s, l) => s + l.lineTotal, 0);
  const rate = Number.isFinite(markupRate) && markupRate > 0 ? markupRate : 0;
  const markupAmount = subtotal * rate;
  return { lines: full, subtotal, markupRate: rate, markupAmount, grandTotal: subtotal + markupAmount };
}
