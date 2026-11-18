import type { ValidationIssue } from "@/lib/types";

/** Plain-text validation messages (errors in dark brown, warnings in amber). */
export default function Issues({ issues }: { issues: ValidationIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <ul className="no-print space-y-2" role="alert">
      {issues.map((issue, i) => (
        <li
          key={i}
          className={`rounded-2xl px-4 py-2 text-sm font-bold ${
            issue.level === "error" ? "bg-ink text-cream" : "bg-accent text-ink"
          }`}
        >
          {issue.level === "error" ? "⛔ " : "⚠️ "}
          {issue.message}
        </li>
      ))}
    </ul>
  );
}
