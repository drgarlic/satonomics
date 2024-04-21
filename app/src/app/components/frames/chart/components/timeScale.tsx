import { chartState, GENESIS_DAY, ONE_DAY_IN_MS } from "/src/scripts";

export function TimeScale() {
  return (
    <div class="flex overflow-y-auto border-t border-white bg-black">
      <Button onClick={() => setTimeScale()}>All Time</Button>
      <Gap />
      <Button onClick={() => setTimeScale(7)}>1 Week</Button>
      <Gap />
      <Button onClick={() => setTimeScale(30)}>1 Month</Button>
      <Gap />
      <Button onClick={() => setTimeScale(30 * 6)}>6 Months</Button>
      <Gap />
      <Button
        onClick={() =>
          setTimeScale(
            Math.ceil(
              (new Date().valueOf() -
                new Date(`${new Date().getUTCFullYear()}-01-01`).valueOf()) /
                ONE_DAY_IN_MS,
            ),
          )
        }
      >
        Year To Date
      </Button>
      <Gap />
      <Button onClick={() => setTimeScale(365)}>1 Year</Button>
      <Gap />
      <Button onClick={() => setTimeScale(2 * 365)}>2 Years</Button>
      <Gap />
      <Button onClick={() => setTimeScale(4 * 365)}>4 Years</Button>
      <Gap />
      <Button onClick={() => setTimeScale(8 * 365)}>8 Years</Button>
    </div>
  );
}

function Button(props: ParentProps & { onClick: VoidFunction }) {
  return (
    <button
      class="min-w-20 flex-shrink-0 flex-grow whitespace-nowrap px-3 py-1 first:border-none active:scale-95"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

function Gap() {
  return <div class="border-l border-dashed border-white" />;
}

function setTimeScale(days?: number) {
  const to = new Date();
  to.setDate(to.getDate() + 1);

  if (days) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    chartState.chart?.timeScale().setVisibleRange({
      from: (from.getTime() / 1000) as Time,
      to: (to.getTime() / 1000) as Time,
    });
  } else {
    // chartState.chart?.timeScale().fitContent();
    chartState.chart?.timeScale().setVisibleRange({
      from: (new Date(
        // datasets.candlesticks.values()?.[0]?.date || "",
        GENESIS_DAY,
      ).getTime() / 1000) as Time,
      to: (to.getTime() / 1000) as Time,
    });
  }
}
