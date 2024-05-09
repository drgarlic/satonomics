import { AnchorAnalytics } from "./components/anchorAnalytics";
import { AnchorAPI } from "./components/anchorAPI";
import { AnchorGit } from "./components/anchorGit";
import { AnchorHome } from "./components/anchorHome";
import { AnchorLogo } from "./components/anchorLogo";
import { AnchorNostr } from "./components/anchorNostr";
import { ButtonChart } from "./components/buttonChart";
import { ButtonFavorites } from "./components/buttonFavorites";
import { ButtonHistory } from "./components/buttonHistory";
import { ButtonRefresh } from "./components/buttonRefresh";
import { ButtonSearch } from "./components/buttonSearch";
import { ButtonSettings } from "./components/buttonSettings";
import { ButtonTree } from "./components/buttonTree";

export function StripDesktop({
  selected,
  setSelected,
  needsRefresh,
}: {
  selected: Accessor<FrameName>;
  setSelected: Setter<FrameName>;
  needsRefresh: Accessor<boolean>;
}) {
  return (
    // <div
    //   class={classPropToString([
    //     env.standalone && "pb-8 md:pb-3",
    //     "flex flex-col justify-around bg-black bg-black/85 p-3 backdrop-blur",
    //   ])}
    // >
    <>
      <AnchorLogo />

      <ButtonTree selected={selected} setSelected={setSelected} />
      <ButtonFavorites selected={selected} setSelected={setSelected} />
      <ButtonSearch selected={selected} setSelected={setSelected} />
      <ButtonHistory selected={selected} setSelected={setSelected} />

      <ButtonSettings selected={selected} setSelected={setSelected} />

      <div class="size-full" />

      <Show when={needsRefresh()}>
        <ButtonRefresh />
      </Show>

      <AnchorAPI />
      <AnchorGit />
      <AnchorNostr />
      <AnchorAnalytics />
      <AnchorHome />
    </>
    // </div>
  );
}

export function StripMobile({
  selected,
  setSelected,
  needsRefresh,
}: {
  selected: Accessor<FrameName>;
  setSelected: Setter<FrameName>;
  needsRefresh: Accessor<boolean>;
}) {
  return (
    <>
      <ButtonChart selected={selected} setSelected={setSelected} />
      <ButtonTree selected={selected} setSelected={setSelected} />
      <ButtonFavorites selected={selected} setSelected={setSelected} />
      <ButtonSearch selected={selected} setSelected={setSelected} />
      <ButtonHistory selected={selected} setSelected={setSelected} />
      <ButtonSettings selected={selected} setSelected={setSelected} />
    </>
  );
}
