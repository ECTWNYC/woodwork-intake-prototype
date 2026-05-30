interface RationalePanelProps {
  headline: string;
  body: string;
  insight?: string;
}

export default function RationalePanel({
  headline,
  body,
  insight,
}: RationalePanelProps) {
  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-900/80 text-teal-400">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </span>
        <span className="text-xs font-semibold tracking-widest text-teal-500 uppercase">
          Design Rationale
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold leading-snug text-zinc-100">
          {headline}
        </h3>
        <p className="text-sm leading-relaxed text-zinc-400">{body}</p>
      </div>

      {insight && (
        <div className="rounded-lg border border-teal-900/60 bg-teal-950/40 px-4 py-3">
          <p className="text-xs leading-relaxed text-teal-300">
            <span className="font-semibold">Strategic insight: </span>
            {insight}
          </p>
        </div>
      )}
    </aside>
  );
}
