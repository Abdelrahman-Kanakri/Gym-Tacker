import { X } from 'lucide-react';
import type { SetEntry } from '../types/workout';

export default function SetChip({
  set,
  isTop,
  onChange,
  onRemove,
}: {
  set: SetEntry;
  isTop: boolean;
  onChange: (field: 'weight' | 'reps', value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-2.5 ${
        isTop ? 'border-cyan bg-cyan/15 shadow-[0_0_8px_rgba(46,230,214,0.12)]' : 'border-border bg-surface-3'
      }`}
    >
      <input
        type="text"
        inputMode="decimal"
        placeholder="kg"
        value={set.weight}
        onChange={(e) => onChange('weight', e.target.value)}
        className="w-9 bg-transparent text-center font-mono text-xs text-text"
      />
      <span className="text-[11px] text-text-faint">&times;</span>
      <input
        type="text"
        inputMode="numeric"
        placeholder="reps"
        value={set.reps}
        onChange={(e) => onChange('reps', e.target.value)}
        className="w-9 bg-transparent text-center font-mono text-xs text-text"
      />
      <button onClick={onRemove} className="p-0.5 text-text-faint hover:text-danger">
        <X size={12} />
      </button>
    </div>
  );
}
