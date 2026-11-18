"use client";

export const STEP_LABELS = ["Load Audit", "Design Choices", "Results", "Cost & Quotation"] as const;

interface Props {
  current: number; // 0-based
  /** Highest step index the user is currently allowed to open. */
  maxReachable: number;
  onSelect: (index: number) => void;
}

export default function Stepper({ current, maxReachable, onSelect }: Props) {
  return (
    <nav aria-label="Progress" className="no-print">
      <ol className="flex items-start justify-between gap-1 sm:gap-3">
        {STEP_LABELS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          const locked = i > maxReachable;
          return (
            <li key={label} className="flex flex-1 flex-col items-center text-center">
              <div className="flex w-full items-center">
                <div className={`h-1 flex-1 rounded-full ${i === 0 ? "opacity-0" : done || active ? "bg-accent" : "bg-ink/20"}`} />
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => onSelect(i)}
                  aria-current={active ? "step" : undefined}
                  className={`mx-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-black shadow-soft transition sm:h-12 sm:w-12 sm:text-lg ${
                    active
                      ? "scale-110 bg-accent text-ink ring-2 ring-ink"
                      : done
                        ? "bg-ink text-cream"
                        : "border border-ink/20 bg-paper text-ink/70"
                  } ${locked ? "cursor-not-allowed opacity-50" : "hover:scale-110"}`}
                >
                  {done ? "✓" : i + 1}
                </button>
                <div
                  className={`h-1 flex-1 rounded-full ${i === STEP_LABELS.length - 1 ? "opacity-0" : done ? "bg-accent" : "bg-ink/20"}`}
                />
              </div>
              <span className={`mt-1 text-[11px] font-extrabold leading-tight sm:text-sm ${active ? "text-ink" : "text-ink/60"}`}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
