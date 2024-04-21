import { Meta, Title } from "@solidjs/meta";

import packageJSON from "/src/../package.json";
import { priceToUSLocale, run } from "/src/scripts";

export function Head({
  last,
}: {
  last: Accessor<DatasetCandlestickData | null>;
}) {
  return (
    <>
      <Title>
        {run(() => {
          const _last = last();
          return `${
            _last ? `${priceToUSLocale(_last.close, false)} | ` : ""
          }Satonomics`;
        })}
      </Title>
      <Meta name="description" content={packageJSON.description} />
    </>
  );
}
