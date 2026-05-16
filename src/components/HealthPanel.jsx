import { computeHealthScores } from "../utils/calculations";
import { StatusBadge } from "./StatusBadge";

const panels = [
  { key: "compressor", name: "Compressor" },
  { key: "pump", name: "Pump / Flow" },
  { key: "waterQuality", name: "Water Quality" },
];

export function HealthPanel({ history = [] }) {
  const scores = computeHealthScores(history);

  return (
    <section className="rounded-xl border border-slate-800 bg-[#111827] p-4">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Health</p>
        <h3 className="text-base font-semibold text-slate-100">Subsystem Health</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {panels.map((panel) => {
          const score = scores[panel.key];

          return (
            <article key={panel.key} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-medium text-slate-200">{panel.name}</h4>
                <StatusBadge status={score.status} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{score.reason}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}