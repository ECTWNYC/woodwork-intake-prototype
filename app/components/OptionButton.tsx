"use client";

interface OptionButtonProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  icon?: string;
}

export default function OptionButton({
  label,
  description,
  selected,
  onClick,
  icon,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-start gap-3 w-full rounded-xl border px-4 py-3.5 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
        selected
          ? "border-teal-500 bg-teal-950/60 shadow-sm shadow-teal-900/40"
          : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800/60",
      ].join(" ")}
      aria-pressed={selected}
    >
      <span
        className={[
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150",
          selected
            ? "border-teal-500 bg-teal-500"
            : "border-zinc-600 bg-transparent",
        ].join(" ")}
      >
        {selected && (
          <svg
            className="h-2.5 w-2.5 text-zinc-950"
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <path d="M6.6 1.4 3 5 1.4 3.4.6 4.2l2.4 2.4 4.2-4.2z" />
          </svg>
        )}
      </span>
      <span className="flex flex-col gap-0.5">
        <span
          className={[
            "text-sm font-medium leading-snug",
            selected ? "text-teal-100" : "text-zinc-200",
          ].join(" ")}
        >
          {icon && <span className="mr-1.5">{icon}</span>}
          {label}
        </span>
        {description && (
          <span className="text-xs leading-relaxed text-zinc-500">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}
