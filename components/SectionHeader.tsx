type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, title, description }: Props) {
  return (
    <div className="mb-7 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-black uppercase tracking-[0.26em] text-[#ff6b35]">{eyebrow}</p>}
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h2>
      </div>
      {description && <p className="max-w-2xl text-sm leading-6 text-neutral-400 md:text-right">{description}</p>}
    </div>
  );
}
