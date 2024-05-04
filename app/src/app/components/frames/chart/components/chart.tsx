import { chartState, cleanChart } from "/src/scripts";

export function Chart() {
  onMount(() => chartState.reset?.());

  onCleanup(cleanChart);

  return (
    <div
      id="chart"
      class="h-full w-full cursor-crosshair transition-opacity duration-300 ease-out"
    />
  );
}
