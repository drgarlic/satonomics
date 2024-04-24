import { generate } from "lean-qr";

export function Title({
  presets,
  qrcode,
}: {
  presets: Presets;
  qrcode: ASS<string>;
}) {
  return (
    <div class="flex flex-1 items-center overflow-y-auto pb-1.5">
      <button
        onClick={() => {
          qrcode.set(() =>
            generate(document.location.href).toDataURL({
              on: [0xff, 0xff, 0xff, 0xff],
              off: [0x00, 0x00, 0x00, 0x00],
            }),
          );
        }}
      >
        <IconTablerQrcode class="size-8 md:size-10" />
      </button>
      <div class="flex-1 -space-y-1 whitespace-nowrap px-1 md:mt-0.5 md:-space-y-1.5">
        <h3 class="text-xs opacity-50">{`/ ${[...presets.selected().path.map(({ name }) => name), presets.selected().name].join(" / ")}`}</h3>
        <h1 class="text-xl font-bold">{presets.selected().title}</h1>
      </div>
    </div>
  );
}
