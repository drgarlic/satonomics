import { chartState, cleanChart } from "/src/scripts";

export function Chart({ visible }: { visible: () => boolean }) {
  onMount(() => chartState.reset?.());

  onCleanup(cleanChart);

  return (
    <div
      id="chart"
      class="h-full w-full cursor-crosshair transition-opacity duration-300 ease-out"
      style={{
        opacity: visible() ? 1 : 0,
      }}
    />
  );
}
