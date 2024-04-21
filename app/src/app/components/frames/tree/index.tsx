import { scrollIntoView, sleep, tick } from "/src/scripts";
import { createASS } from "/src/solid";

import { Counter } from "../counter";
import { ScrollableFrame } from "../scrollable";
import { Tree } from "./components";

export function TreeFrame({
  presets,
  selectedFrame,
}: {
  presets: Presets;
  selectedFrame: Accessor<FrameName>;
}) {
  const div = createASS<HTMLDivElement | undefined>(undefined);

  onMount(() => {
    goToSelected(presets);
  });

  return (
    <div
      class="flex max-h-full min-h-0 flex-1 flex-col border-b border-white"
      style={{
        display: selectedFrame() !== "Tree" ? "none" : undefined,
      }}
    >
      <ScrollableFrame>
        <Counter
          setRef={div.set}
          count={() => presets.list.length}
          name="presets"
        />

        <div class="py-1">
          <Tree
            tree={presets.tree}
            openedFolders={presets.openedFolders}
            selected={presets.selected}
            selectPreset={presets.select}
            favorites={presets.favorites}
          />
        </div>
        <div class="border-t border-dashed border-white" />
        <Anchor href="/routes" primary="API" secondary="Satonomics" />
        <div class="border-t border-dashed border-white/25" />
        <Anchor
          href="https://primal.net/p/npub1jagmm3x39lmwfnrtvxcs9ac7g300y3dusv9lgzhk2e4x5frpxlrqa73v44"
          primary="Social"
          secondary="NOSTR"
        />
        <div class="border-t border-dashed border-white/25" />
        <Anchor
          href="https://github.com/satonomics-org"
          primary="Repository"
          secondary="Github"
        />
        <div class="border-t border-dashed border-white/25" />
        <Anchor
          href="mailto:contact@satonomics.xyz"
          primary="Contact"
          secondary="Email"
        />
        <div class="border-t border-dashed border-white/25" />
        <Anchor
          href="https://counter.dev/dashboard.html?user=wjfpwo2032fk&token=GAP9y3FM4o0%3D"
          primary="Analytics"
          secondary="Counter.dev"
        />
      </ScrollableFrame>
      <div class="flex w-full border-t border-dashed border-white bg-black">
        <Button
          onClick={() => {
            presets.openedFolders.set((s) => {
              s.clear();
              return s;
            });

            sleep(10);

            scrollIntoView(div());
          }}
        >
          Close all folders
        </Button>
        <div class="border-r border-dashed border-white" />
        <Button onClick={() => goToSelected(presets)}>Go to selected</Button>
      </div>
    </div>
  );
}

export function Button({
  onClick,
  children,
}: { onClick: VoidFunction } & ParentProps) {
  return (
    <button
      class="group flex w-full flex-1 items-center justify-center bg-black p-3 hover:bg-white/20"
      onClick={onClick}
    >
      <span class="group-active:scale-95">{children}</span>
    </button>
  );
}

async function goToSelected(presets: Presets) {
  batch(() =>
    presets.selected().path.forEach(({ id }) => {
      presets.openedFolders.set((s) => {
        s.add(id);
        return s;
      });
    }),
  );

  await tick();

  scrollIntoView(document.getElementById(presets.selected().id), "center");
}

function Anchor({
  href,
  primary,
  secondary,
}: {
  href: string;
  primary: string;
  secondary: string;
}) {
  return (
    <a
      href={href}
      target={
        href.startsWith("/") || href.startsWith("http") ? "_blank" : undefined
      }
      class="block w-full px-3 py-1.5 text-left hover:underline"
    >
      {primary} <span class="opacity-50"> - {secondary}</span>
    </a>
  );
}
