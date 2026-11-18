/** Small labelled marker for features that exist only in the full version. */
export default function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="no-print rounded-2xl border-2 border-dashed border-white/25 px-3 py-2 text-xs font-bold text-white/60">
      🚧 Coming in full version: {children}
    </div>
  );
}
