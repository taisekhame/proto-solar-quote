// =============================================================================
// Hardcoded sample data for the prototype. In the full app this moves to a
// component database (exact model numbers, datasheet refs, verified dates).
// Type-only imports so the file can be run by `npm run verify`.
// =============================================================================

import type { Appliance, CustomerDetails, PriceBook } from "./types";

export const CUSTOM_PRESET = "Custom";

/** Appliance presets: selecting one pre-fills typical watts/hours (still editable). */
export const APPLIANCE_PRESETS: { name: string; watts: number; hours: number }[] = [
  { name: "Television", watts: 120, hours: 6 },
  { name: "Refrigerator", watts: 250, hours: 10 },
  { name: "Ceiling Fan", watts: 75, hours: 8 },
  { name: "Bulbs", watts: 15, hours: 6 },
  { name: "Laptop", watts: 90, hours: 5 },
  { name: "Water Pump", watts: 750, hours: 2 },
  { name: "Air Conditioner", watts: 1500, hours: 8 },
  { name: "Freezer", watts: 200, hours: 10 },
];

/** Demo load from the guides: 1,870 W connected, 9,640 Wh = 9.64 kWh/day. */
export const DEMO_APPLIANCES: Appliance[] = [
  { id: "demo-tv", preset: "Television", name: "Television", quantity: 2, watts: 120, hoursPerDay: 6 },
  { id: "demo-fridge", preset: "Refrigerator", name: "Refrigerator", quantity: 1, watts: 250, hoursPerDay: 10 },
  { id: "demo-fan", preset: "Ceiling Fan", name: "Ceiling Fan", quantity: 4, watts: 75, hoursPerDay: 8 },
  { id: "demo-bulbs", preset: "Bulbs", name: "Bulbs", quantity: 10, watts: 15, hoursPerDay: 6 },
  { id: "demo-laptop", preset: "Laptop", name: "Laptop", quantity: 2, watts: 90, hoursPerDay: 5 },
  { id: "demo-pump", preset: "Water Pump", name: "Water Pump", quantity: 1, watts: 750, hoursPerDay: 2 },
];

export const EMPTY_CUSTOMER: CustomerDetails = { name: "", phone: "", address: "" };

export const BACKUP_HOUR_OPTIONS = [4, 6, 8, 10, 12, 24] as const;
export const PANEL_WATT_OPTIONS = [550, 620] as const;

export const DEFAULT_MARKUP_PERCENT = 15;

/**
 * DEMO PLACEHOLDER PRICES (NGN) — not verified market prices [G1 §12, G2 Part 13].
 *  From the guides: 10 kVA inverter 2,500,000 · lithium battery 1,500,000 ·
 *   620 W panel 180,000 · DC protection 150,000 · cables 200,000 ·
 *   mounting 250,000 · installation labour 250,000.
 *  Invented for the prototype (not in the guides): all other inverter sizes,
 *   the 550 W panel and the tubular battery.
 */
export const PRICE_BOOK: PriceBook = {
  inverterByKva: {
    1.5: 650_000,
    2.5: 900_000,
    3.5: 1_200_000,
    5: 1_500_000,
    6: 1_800_000,
    7.5: 2_100_000,
    10: 2_500_000, // from guides
    15: 3_800_000,
    20: 5_000_000,
    30: 7_500_000,
  },
  lithiumBattery: 1_500_000, // from guides (G1 §12)
  tubularBattery: 320_000, // placeholder
  panelByWatts: {
    550: 160_000, // placeholder
    620: 180_000, // from guides
  },
  dcProtectionSet: 150_000,
  cablesSet: 200_000,
  mountingSet: 250_000,
  installationLabour: 250_000,
};

export const PRICE_DATE_STAMP = "Demo placeholder prices — not verified market prices";
