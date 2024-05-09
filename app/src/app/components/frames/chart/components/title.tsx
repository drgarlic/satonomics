import { generate } from "lean-qr";

export function Title({
  presets,
  qrcode,
}: {
  presets: Presets;
  qrcode: ASS<string>;
}) {
  return (
    <div class="flex flex-1 items-center overflow-y-auto pb-1.5 text-orange-100/50">
      <div class="flex-1 -space-y-1 whitespace-nowrap px-1 md:mt-0.5 md:-space-y-1.5">
        <h3 class="text-xs">{`/ ${[...presets.selected().path.map(({ name }) => name), presets.selected().name].join(" / ")}`}</h3>
        <h1 class="text-xl font-bold text-white">{presets.selected().title}</h1>
      </div>
    </div>
  );
}
