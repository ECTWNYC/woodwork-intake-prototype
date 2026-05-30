interface StepCardProps {
  tag?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function StepCard({
  tag,
  title,
  subtitle,
  children,
}: StepCardProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {tag && (
          <span className="inline-flex items-center self-start rounded-full border border-teal-800 bg-teal-950 px-3 py-0.5 text-xs font-semibold tracking-wide text-teal-400 uppercase">
            {tag}
          </span>
        )}
        <h2 className="text-2xl font-semibold leading-snug text-zinc-50">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base leading-relaxed text-zinc-400">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
