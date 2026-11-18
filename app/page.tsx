import Link from "next/link";

const FEATURES = [
  { icon: "📋", title: "Load Audit", text: "List the appliances" },
  { icon: "⚡", title: "Automatic Sizing", text: "Inverter, battery, panels" },
  { icon: "🧾", title: "Instant Quotation", text: "Costed and ready to print" },
];

export default function LandingPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 text-center sm:gap-7">
        <div className="text-6xl sm:text-7xl" aria-hidden>
          ☀️
        </div>
        <p className="rounded-full bg-grape px-4 py-1 text-xs font-extrabold uppercase tracking-widest text-sun">
          SunSizer · prototype
        </p>
        <h1 className="max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
          Size a solar system and get a quotation{" "}
          <span className="rounded-xl bg-sun px-2 text-black">in minutes</span>
        </h1>

        <ul className="grid w-full max-w-3xl grid-cols-3 gap-2 sm:gap-4">
          {FEATURES.map((f) => (
            <li key={f.title} className="card flex flex-col items-center gap-1 !p-3 sm:!p-4">
              <span className="text-2xl sm:text-3xl" aria-hidden>
                {f.icon}
              </span>
              <span className="text-xs font-extrabold sm:text-base">{f.title}</span>
              <span className="hidden text-xs text-white/70 sm:block">{f.text}</span>
            </li>
          ))}
        </ul>

        <Link href="/quote" className="btn-sun px-8 py-4 text-lg sm:px-12 sm:py-5 sm:text-2xl">
          Start a Quotation →
        </Link>
      </div>
    </main>
  );
}
