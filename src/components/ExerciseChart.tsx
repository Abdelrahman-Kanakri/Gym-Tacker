import type { DailyBest } from '../lib/analytics';
import { fromISO, shortDate } from '../lib/dates';

export default function ExerciseChart({ daily }: { daily: DailyBest[] }) {
  if (daily.length < 2) {
    return (
      <p className="m-0 py-3 text-center text-[11px] text-text-faint">
        Log this exercise on another day to see a progression trend.
      </p>
    );
  }

  const width = 320;
  const height = 90;
  const padX = 8;
  const padY = 10;

  const values = daily.map((d) => d.e1rm);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = daily.map((d, i) => {
    const x = padX + (i / (daily.length - 1)) * (width - padX * 2);
    const y = height - padY - ((d.e1rm - min) / range) * (height - padY * 2);
    return { x, y, d };
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="py-2">
      <div className="mb-1 flex items-center justify-between text-[10px] text-text-faint">
        <span>{shortDate(fromISO(daily[0].dateISO))}</span>
        <span className="font-mono text-cyan">est. 1RM · {Math.round(max)} kg peak</span>
        <span>{shortDate(fromISO(daily[daily.length - 1].dateISO))}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        <path d={path} fill="none" stroke="#2ee6d6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 3 : 2} fill="#2ee6d6" />
        ))}
      </svg>
    </div>
  );
}
