interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
          Step {current} of {total}
        </span>
        <span className="text-xs font-medium text-teal-400">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-teal-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>
    </div>
  );
}
