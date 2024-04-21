export const Header = ({
  needsRefresh,
  onClick,
}: {
  needsRefresh: Accessor<boolean>;
  onClick: VoidFunction;
}) => {
  return (
    <header
      class="relative flex h-[7dvh] flex-none cursor-pointer select-none items-center justify-center border-b border-white bg-black/80 md:h-[7.5dvh]"
      onClick={onClick}
    >
      <Show when={needsRefresh()}>
        <span class="absolute inset-y-0 left-0 ml-4 flex items-center md:ml-8">
          <IconTablerRefreshAlert class="absolute size-6 animate-ping text-red-200 opacity-50 md:size-8" />
          <IconTablerRefreshAlert class="relative size-6 text-red-300 md:size-8" />
        </span>
      </Show>
      {/* <span class="font-hipnouma scale-x-150 text-[4rem] leading-none md:scale-y-100"> */}
      {/* <span class="scale-x-50 text-6xl font-black uppercase md:scale-y-100"> */}
      <span class="font-solstice scale-x-150 scale-y-[0.5] text-[3.5rem] uppercase md:scale-y-100">
        SAtonomics
      </span>
    </header>
  );
};
