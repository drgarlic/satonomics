import uFuzzy from "@leeoniya/ufuzzy";
import { createVisibilityObserver } from "@solid-primitives/intersection-observer";

import { scrollIntoView } from "/src/scripts";
import { createASS } from "/src/solid";

import { Counter } from "../counter";
import { ScrollableFrame } from "../scrollable";
import { Button } from "../tree";
import { Line } from "../tree/components";

const PER_PAGE = 100;

export const INPUT_PRESET_SEARCH_ID = "input-search-preset";

export function SearchFrame({
  presets,
  selectedFrame,
}: {
  presets: Presets;
  selectedFrame: Accessor<FrameName>;
}) {
  const counterRef = createASS<HTMLDivElement | undefined>(undefined);

  const search = createASS("", {
    equals: false,
  });

  const inputRef = createASS<HTMLInputElement | undefined>(undefined);

  const config: uFuzzy.Options = {
    intraIns: Infinity,
    intraChars: `[a-z\d' ]`,
  };

  const fuzzyMultiInsert = new uFuzzy({
    intraIns: 1,
  });
  const fuzzyMultiInsertFuzzier = new uFuzzy(config);
  const fuzzySingleError = new uFuzzy({
    intraMode: 1,
    ...config,
  });
  const fuzzySingleErrorFuzzier = new uFuzzy({
    intraMode: 1,
    ...config,
  });

  const haystack = presets.list.map(
    (preset) =>
      `${preset.title}\t/ ${[...preset.path.map(({ name }) => name), preset.name].join(" / ")}`,
  );

  const searchResult = createMemo(() => {
    scrollIntoView(counterRef());

    const needle = search();

    if (!needle) return null;

    const outOfOrder = 5;
    const infoThresh = 100_000;

    let result = fuzzyMultiInsert.search(
      haystack,
      needle,
      undefined,
      infoThresh,
    );

    if (!result?.[0]?.length || !result?.[1]) {
      result = fuzzyMultiInsert.search(
        haystack,
        needle,
        outOfOrder,
        infoThresh,
      );
    }

    if (!result?.[0]?.length || !result?.[1]) {
      result = fuzzySingleError.search(
        haystack,
        needle,
        outOfOrder,
        infoThresh,
      );
    }

    if (!result?.[0]?.length || !result?.[1]) {
      result = fuzzySingleErrorFuzzier.search(
        haystack,
        needle,
        outOfOrder,
        infoThresh,
      );
    }

    if (!result?.[0]?.length || !result?.[1]) {
      result = fuzzyMultiInsertFuzzier.search(
        haystack,
        needle,
        undefined,
        infoThresh,
      );
    }

    if (!result?.[0]?.length || !result?.[1]) {
      result = fuzzyMultiInsertFuzzier.search(
        haystack,
        needle,
        outOfOrder,
        infoThresh,
      );
    }

    return result;
  });

  const resultCount = createMemo(() => searchResult()?.[0]?.length || 0);

  return (
    <div
      class="flex max-h-full min-h-0 flex-1 flex-col border-b border-white"
      style={{
        display: selectedFrame() !== "Search" ? "none" : undefined,
      }}
    >
      <div
        class="border-b border-dashed border-white bg-black"
        style={{
          "border-bottom": !search() ? "none" : undefined,
        }}
      >
        <div
          class="relative flex cursor-text items-center space-x-0.5 px-3 py-2 hover:bg-white/20"
          onClick={() => inputRef()?.focus()}
        >
          <IconTablerSearch />
          <input
            id={INPUT_PRESET_SEARCH_ID}
            ref={inputRef.set}
            class="w-full bg-transparent p-1  caret-orange-500 placeholder:text-white/50 focus:outline-none"
            placeholder="Type here"
            value={search()}
            onInput={(event) => search.set(event.target.value)}
          />
          <span class="-mx-1 flex size-5 flex-none items-center justify-center rounded-md border border-white text-xs font-bold">
            <IconTablerSlash />
          </span>
        </div>
      </div>
      <ScrollableFrame>
        <Show when={search()}>
          <Counter setRef={counterRef.set} count={resultCount} name="results" />
          <div
            class="py-1"
            style={{
              display: !resultCount() ? "none" : undefined,
            }}
          >
            {(() => {
              const r = searchResult();

              if (r) {
                return (
                  <ListSection
                    haystack={haystack}
                    presets={presets}
                    searchResult={() => r}
                  />
                );
              } else {
                return undefined;
              }
            })()}
          </div>
        </Show>
      </ScrollableFrame>
      <div class="border-t border-dashed border-white bg-black">
        <Button
          onClick={() => {
            search.set("");
            inputRef()?.focus();
          }}
        >
          Reset search
        </Button>
      </div>
    </div>
  );
}

function ListSection({
  searchResult,
  pageIndex = 0,
  haystack,
  presets,
}: {
  searchResult: Accessor<uFuzzy.SearchResult>;
  pageIndex?: number;
  haystack: string[];
  presets: Presets;
}) {
  const div = createASS<HTMLDivElement | undefined>(undefined);

  const useVisibilityObserver = createVisibilityObserver();

  const visible = useVisibilityObserver(div);

  const showNextPage = createMemo<boolean>(
    (previous) => previous || visible(),
    false,
  );

  const list = createMemo(() =>
    computeList({
      searchResult: searchResult(),
      pageIndex,
      haystack,
      presets,
    }),
  );

  return (
    <div>
      <For each={list()}>
        {({ preset, path, title }) => (
          <Line
            id={`search-${preset.id}`}
            name={title}
            onClick={() => presets.select(preset)}
            active={() => presets.selected() === preset}
            path={path}
          />
        )}
      </For>
      <Show when={list().length === PER_PAGE}>
        <div ref={div.set}>
          <Show when={showNextPage()}>
            <ListSection
              searchResult={searchResult}
              haystack={haystack}
              presets={presets}
              pageIndex={pageIndex + 1}
            />
          </Show>
        </div>
      </Show>
    </div>
  );
}

function computeList({
  searchResult,
  pageIndex,
  haystack,
  presets,
}: {
  searchResult: uFuzzy.SearchResult;
  pageIndex: number;
  haystack: string[];
  presets: Presets;
}) {
  let list: {
    preset: Preset;
    path: string;
    title: string;
  }[] = [];

  let [indexes, info, order] = searchResult || [null, null, null];

  const minIndex = pageIndex * PER_PAGE;

  if (indexes?.length) {
    const maxIndex = Math.min(
      (order || indexes).length - 1,
      minIndex + PER_PAGE - 1,
    );

    list = Array(maxIndex - minIndex + 1);

    if (info && order) {
      for (let i = minIndex; i <= maxIndex; i++) {
        let infoIdx = order[i];

        const [title, path] = uFuzzy
          .highlight(haystack[info.idx[infoIdx]], info.ranges[infoIdx])
          .split("\t");

        list[i % 100] = {
          preset: presets.list[info.idx[infoIdx]],
          path,
          title,
        };
      }
    } else {
      for (let i = minIndex; i <= maxIndex; i++) {
        let index = indexes[i];

        const [title, path] = haystack[index].split("\t");

        list[i % 100] = {
          preset: presets.list[index],
          path,
          title,
        };
      }
    }
  }

  return list;
}
