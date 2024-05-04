import { chartState, createChart, setWhitespace } from "/src/scripts";

let dispose: VoidFunction | undefined = undefined;

export const renderChart = async (params: {
  datasets: Datasets;
  liveCandle: Accessor<DatasetCandlestickData | null>;
  legendSetter: Setter<PresetLegend>;
  preset: Preset;
  presets: Presets;
  activeResources: Accessor<Set<ResourceDataset<any, any>>>;
}) => {
  dispose?.();

  createRoot((_dispose) => {
    dispose = _dispose;

    chartState.reset = () => {
      renderChart(params);
    };

    const {
      datasets,
      liveCandle,
      legendSetter,
      presets,
      preset,
      activeResources,
    } = params;

    const { scale } = preset;

    createChart(scale);

    const { chart } = chartState;

    if (!chart) return;

    try {
      setWhitespace(chart, scale);

      console.log(`preset: ${preset.id}`);

      const legend = preset.applyPreset({
        chart,
        datasets,
        liveCandle,
        preset,
        presets,
        activeResources,
      });

      legendSetter(legend);
    } catch (error) {
      console.error("chart: render: failed", error);
    }
  });
};
