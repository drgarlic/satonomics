import { Meta, Title } from "@solidjs/meta";

import packageJSON from "/src/../package.json";
import { priceToUSLocale } from "/src/scripts/utils/locale";
import { run } from "/src/scripts/utils/run";

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
