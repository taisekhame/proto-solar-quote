// Shared types. Type-only file: safe to import with `import type` anywhere.

export type BatteryType = "lithium" | "tubular";

export interface Appliance {
  id: string;
  /** Preset label from the dropdown, or "Custom". */
  preset: string;
  /** Display name (equals preset unless preset is "Custom"). */
  name: string;
  quantity: number;
  /** Rated power of ONE unit in watts. */
  watts: number;
  hoursPerDay: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
}

/** Editable "advanced" design assumptions (Step 2). */
export interface Assumptions {
  peakSunHours: number; // PSH, h/day
  performanceRatio: number; // PR
  powerFactor: number; // PF
  designMargin: number; // SF applied to connected load
  inverterEfficiency: number; // eta_inv
  batteryEfficiency: number; // eta_bat
}

export interface DesignChoices {
  backupHours: number;
  batteryType: BatteryType;
  panelWatts: number;
}

export interface LoadAudit {
  connectedLoadW: number;
  dailyEnergyWh: number;
  dailyEnergyKwh: number;
  averagePowerW: number;
}

export interface InverterResult {
  requiredKw: number; // connected load x design margin
  requiredKva: number; // requiredKw / PF
  recommendedKva: number; // rounded UP to standard size
  recommendedKw: number; // recommendedKva x PF
  /** True when the load exceeds the largest standard size on the list. */
  exceedsLargestSize: boolean;
}

export interface BatteryResult {
  dod: number;
  requiredWh: number;
  requiredKwh: number;
  systemVoltage: number;
  requiredAh: number;
  /** Total number of battery units to buy. */
  numberOfBatteries: number;
  seriesCount: number; // 1 for lithium (single 51.2 V unit counted individually)
  parallelCount: number;
  installedWh: number; // installed nominal energy
  installedKwh: number;
  description: string; // e.g. "1 x 51.2V 100Ah (5.12 kWh)"
}

export interface PvResult {
  requiredKwp: number;
  requiredWatts: number;
  numberOfPanels: number;
  installedWatts: number;
  installedKwp: number;
}

export interface SystemDesign {
  load: LoadAudit;
  inverter: InverterResult;
  battery: BatteryResult;
  pv: PvResult;
  backupTimeHours: number;
  mpptChargingCurrentA: number;
}

export interface ValidationIssue {
  level: "error" | "warning";
  message: string;
}

/** Demo price book (NGN). Production version: supplier-specific, date-stamped. */
export interface PriceBook {
  inverterByKva: Record<number, number>;
  lithiumBattery: number; // per 51.2V 100Ah (5.12 kWh) unit
  tubularBattery: number; // per 12V 220Ah unit
  panelByWatts: Record<number, number>;
  dcProtectionSet: number;
  cablesSet: number;
  mountingSet: number;
  installationLabour: number;
}

export interface CostLine {
  id: string;
  description: string;
  quantity: number;
  unit: string; // "pc" | "set" | "job"
  unitPrice: number; // NGN
  lineTotal: number; // NGN
}

export interface CostSummary {
  lines: CostLine[];
  subtotal: number;
  markupRate: number; // 0.15 = 15 %
  markupAmount: number;
  grandTotal: number;
}
