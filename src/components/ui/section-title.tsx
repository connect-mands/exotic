interface SectionTitleProps {
  title: string;
  highlight?: string;
  centered?: boolean;
  showDivider?: boolean;
}

export function SectionTitle({
  title,
  highlight,
  centered = true,
  showDivider = false,
}: SectionTitleProps) {
  const align = centered ? "text-center" : "text-left";

  if (highlight) {
    const [before, after] = title.includes(highlight)
      ? [title.replace(highlight, "").trim(), highlight]
      : [title, highlight];

    return (
      <div className={align}>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {before && <span>{before} </span>}
          <span className="text-[#2a7da3]">{after}</span>
        </h2>
        {showDivider && (
          <div className="mx-auto mt-3 h-0.5 w-16 bg-[#7ec8e3]" aria-hidden />
        )}
      </div>
    );
  }

  return (
    <div className={align}>
      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
      {showDivider && (
        <div className="mx-auto mt-3 h-0.5 w-16 bg-[#7ec8e3]" aria-hidden />
      )}
    </div>
  );
}
