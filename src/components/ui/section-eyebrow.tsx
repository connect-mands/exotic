interface SectionEyebrowProps {
  label: string;
}

export function SectionEyebrow({ label }: SectionEyebrowProps) {
  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <span className="flex items-center gap-1.5" aria-hidden>
        <span className="size-1.5 rounded-full bg-[#2a7da3]" />
        <span className="h-px w-10 bg-[#2a7da3]/60 sm:w-16" />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2a7da3]">
        {label}
      </span>
      <span className="flex items-center gap-1.5" aria-hidden>
        <span className="h-px w-10 bg-[#2a7da3]/60 sm:w-16" />
        <span className="size-1.5 rounded-full bg-[#2a7da3]" />
      </span>
    </div>
  );
}
