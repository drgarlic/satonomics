import { createLazyMemo } from "@solid-primitives/memo";
import { leading, throttle } from "@solid-primitives/scheduled";

import {
  ONE_DAY_IN_MS,
  ONE_SECOND_IN_MS,
  TEN_SECOND_IN_MS,
} from "/src/scripts";
import { createASS } from "/src/solid";

export function createResourceDataset<Scale extends ResourceScale>({
  scale,
  path,
}: {
  scale: Scale;
  path: string;
}) {
  return _createResourceDataset({
    scale,
    path,
    transform:
      scale === "date"
        ? (values) =>
            Object.entries((values || {}) as Record<string, number>).map(
              ([date, value]: [string, number]) => ({
                number: new Date(date).valueOf() / ONE_DAY_IN_MS,
                time: date,
                value: value ?? NaN,
              }),
            )
        : (values) =>
            ((values || []) as number[]).map((value, index) => ({
              number: index,
              time: index as Time,
              value: value ?? NaN,
            })),
  });
}

export function _createResourceDataset<
  Scale extends ResourceScale,
  T = Scale extends "date" ? FetchedDateDataset : FetchedHeightDataset,
  K extends SingleValueData = SingleValueData,
>({
  scale,
  path,
  autoFetch = true,
  transform,
}: {
  scale: Scale;
  path: string;
  transform: (values: T | null) => DatasetValue<K>[];
  autoFetch?: boolean;
}) {
  const url = new URL(
    `${
      location.protocol === "https:"
        ? "https://api.satonomics.xyz"
        : "http://localhost:3110"
    }${path}`,
  );

  const fetchedValues = createASS(null as T | null);
  const loading = createASS(false);
  const source = createASS<Source | null>(null);

  let lastSuccessfulFetch: Date | null = null;

  const throttledFetch = leading(
    throttle,
    async () => {
      if (
        lastSuccessfulFetch &&
        new Date().valueOf() - lastSuccessfulFetch.valueOf() < TEN_SECOND_IN_MS
      )
        return;

      loading.set(true);

      let cache: Cache | undefined;

      try {
        cache = await caches.open("resources");
      } catch {}

      try {
        const fetchedResponse = await fetch(url);

        const clonedResponse = fetchedResponse.clone();

        const _values = await convertResponseToValues<T>(
          fetchedResponse,
          source.set,
        );

        if (_values) {
          lastSuccessfulFetch = new Date();

          console.log("values: setting fetched...");

          fetchedValues.set(() => _values);

          if (cache) {
            cache.put(url, clonedResponse);
          }
        }
      } catch {
        if (!cache) return;

        const cachedResponse = await cache.match(url.toString());

        if (cachedResponse) {
          const _values = await convertResponseToValues<T>(
            cachedResponse,
            source.set,
          );

          if (_values) {
            console.log(`values: setting cached...`);
            fetchedValues.set(() => _values);
          }
        }
      }

      loading.set(false);
    },
    ONE_SECOND_IN_MS,
  );

  const sources = createLazyMemo(() => {
    const _source = source();
    const map = new Map<string, Source>();
    if (_source) {
      map.set(_source.name, _source);
    }
    return map;
  });

  const values = createLazyMemo(() => {
    if (autoFetch) {
      resource.fetch();
    }
    return transform(fetchedValues());
  });

  const resource: ResourceDataset<Scale, T, K> = {
    scale,
    url,
    fetch: throttledFetch,
    fetchedValues,
    source,
    sources,
    values,
    loading,
    drop() {
      fetchedValues.set(null);
      lastSuccessfulFetch = null;
    },
  };

  return resource;
}

async function convertResponseToValues<T>(
  response: Response,
  setSource: Setter<Source | null>,
) {
  const json = await response.json();
  setSource(json.source);
  return json.dataset as T;
}
