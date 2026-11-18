"use client";

import { useEffect, useState } from "react";

interface Props {
  value: number;
  onChange: (n: number) => void;
  step?: string;
  className?: string;
  ariaLabel: string;
  placeholder?: string;
}

/**
 * Number field that lets the user clear / retype freely.
 * Empty or invalid text reports 0, which the validation layer then flags.
 */
export default function NumberInput({ value, onChange, step = "any", className = "", ariaLabel, placeholder }: Props) {
  const [text, setText] = useState(String(value));

  // Re-sync only when the parent value really changed (e.g. preset applied, reset to defaults).
  useEffect(() => {
    const current = text.trim() === "" ? 0 : Number(text);
    if (current !== value) setText(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      aria-label={ariaLabel}
      placeholder={placeholder}
      className={`field ${className}`}
      value={text}
      onChange={(e) => {
        const t = e.target.value;
        setText(t);
        const n = t.trim() === "" ? 0 : Number(t);
        onChange(Number.isFinite(n) ? n : 0);
      }}
    />
  );
}
