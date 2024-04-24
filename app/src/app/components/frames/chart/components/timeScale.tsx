import { chartState, GENESIS_DAY, ONE_DAY_IN_MS } from "/src/scripts";

import { Box } from "../../box";

export function TimeScale() {
  return (
    // <div class="m-2 flex space-x-2 overflow-y-auto rounded-xl border border-orange-200/10 bg-orange-100/5 p-2 backdrop-blur">
    <Box dark padded overflowY>
      <Button onClick={() => setTimeScale()}>All Time</Button>
      <Button onClick={() => setTimeScale(7)}>1 Week</Button>
      <Button onClick={() => setTimeScale(30)}>1 Month</Button>
      <Button onClick={() => setTimeScale(30 * 6)}>6 Months</Button>
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
      <Button onClick={() => setTimeScale(365)}>1 Year</Button>
      <Button onClick={() => setTimeScale(2 * 365)}>2 Years</Button>
      <Button onClick={() => setTimeScale(4 * 365)}>4 Years</Button>
      <Button onClick={() => setTimeScale(8 * 365)}>8 Years</Button>
    </Box>
  );
}

function Button(props: ParentProps & { onClick: VoidFunction }) {
  return (
    <button
      class="min-w-20 flex-shrink-0 flex-grow whitespace-nowrap rounded-lg px-2 py-1.5 hover:bg-white/20 active:scale-95"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
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
