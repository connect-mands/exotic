export function BestPriceSeal() {
  return (
    <div
      className="pointer-events-none absolute -bottom-6 right-0 z-10 hidden select-none lg:block"
      aria-hidden
    >
      <div className="relative flex size-28 rotate-[-12deg] items-center justify-center rounded-full border-4 border-dashed border-gray-300/90 bg-gray-50/95 text-center shadow-sm">
        <div className="absolute inset-2 rounded-full border border-gray-200" />
        <div className="relative px-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
            Guarantee
          </p>
          <p className="mt-0.5 text-sm font-extrabold uppercase leading-tight text-[#2a7da3]">
            Best
            <br />
            Price
          </p>
        </div>
      </div>
    </div>
  );
}
