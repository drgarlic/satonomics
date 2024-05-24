import { createLazyMemo } from "@solid-primitives/memo";

import { ONE_DAY_IN_MS, ONE_MINUTE_IN_MS } from "/src/scripts";
import { createASS } from "/src/solid";

export function createResourceDataset<
  Scale extends ResourceScale,
  Type extends OHLC | number = number,
>({
  scale,
  path,
  setActiveResources,
}: {
  scale: Scale;
  path: string;
  setActiveResources: Setter<Set<ResourceDataset<any, any>>>;
}) {
  const url = `${
    location.protocol === "https:"
      ? "https://api.satonomics.xyz"
      : "http://localhost:3111"
  }${path}`;

  type Dataset = Scale extends "date"
    ? FetchedDateDataset<Type>
    : FetchedHeightDataset<Type>;

  type Value = DatasetValue<
    Type extends number ? SingleValueData : CandlestickData
  >;

  const fetchedJSONs = new Array(
    (new Date().getFullYear() - new Date("2009-01-01").getFullYear()) *
      (scale === "date" ? 2 : 8),
  )
    .fill(null)
    .map((): FetchedResult<Scale, Type> => {
      const json = createASS<FetchedJSON<Scale, Type, Dataset> | null>(null);

      return {
        at: null,
        loading: createASS(false),
        json,
        vec: createMemo(() => {
          const map = json()?.dataset.map || null;

          if (!map) {
            return null;
          }

          if (Array.isArray(map)) {
            return map.map(
              (value, index) =>
                ({
                  number: index,
                  time: index as Time,
                  ...(typeof value !== "number"
                    ? { ...(value as OHLC), value: value.close }
                    : { value: value as number }),
                }) as any as Value,
            );
          } else {
            return Object.entries(map).map(
              ([date, value]) =>
                ({
                  number: new Date(date).valueOf() / ONE_DAY_IN_MS,
                  time: date,
                  ...(typeof value !== "number"
                    ? { ...(value as OHLC), value: value.close }
                    : { value: value as number }),
                }) as any as Value,
            );
          }
        }),
      };
    }) as FetchedResult<Scale, Type>[];

  const _fetch = async (id: number) => {
    const index = scale === "date" ? id - 2009 : Math.floor(id / 13125);

    const fetched = fetchedJSONs[index];

    if (
      fetched.at &&
      new Date().valueOf() - fetched.at.valueOf() < ONE_MINUTE_IN_MS
    )
      return;

    fetched.at = new Date();
    fetched.loading.set(true);

    let cache: Cache | undefined;

    const urlWithQuery = `${url}?chunk=${id}`;

    try {
      cache = await caches.open("resources");

      const cachedResponse = await cache.match(urlWithQuery);

      if (cachedResponse) {
        const json = await convertResponseToJSON<Scale, Type>(cachedResponse);

        if (json) {
          console.log(`values: from cache...`);

          fetched.json.set(() => json);
        }
      }
    } catch {}

    try {
      const fetchedResponse = await fetch(urlWithQuery);

      if (!fetchedResponse.ok) {
        return;
      }

      const clonedResponse = fetchedResponse.clone();

      const json = await convertResponseToJSON<Scale, Type>(fetchedResponse);

      if (json) {
        console.log("values: from fetch...");

        fetched.json.set(() => json);

        if (cache) {
          cache.put(url, clonedResponse);
        }
      }
    } catch {}

    fetched.loading.set(false);
  };

  const resource: ResourceDataset<Scale, Type> = {
    scale,
    url,
    fetch: _fetch,
    fetchedJSONs,
    values: createLazyMemo(() => {
      console.log(url);

      setActiveResources((resources) => resources.add(resource));

      onCleanup(() =>
        setActiveResources((resources) => {
          resources.delete(resource);
          return resources;
        }),
      );

      const flat = fetchedJSONs.flatMap((fetched) => fetched.vec() || []);

      return flat;
    }),
    drop() {
      fetchedJSONs.forEach((fetched) => {
        fetched.at = null;
        fetched.json.set(null);
        fetched.loading.set(false);
      });
    },
  };

  return resource;
}

async function convertResponseToJSON<
  Scale extends ResourceScale,
  Type extends number | OHLC,
>(response: Response) {
  try {
    return (await response.json()) as FetchedJSON<Scale, Type>;
  } catch (_) {
    return null;
  }
}
