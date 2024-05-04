import { Anchor } from "./components/anchor";
import { AnchorLogo } from "./components/anchorLogo";
import { ButtonChart } from "./components/buttonChart";
import { ButtonFavorites } from "./components/buttonFavorites";
import { ButtonHistory } from "./components/buttonHistory";
import { ButtonRefresh } from "./components/buttonRefresh";
import { ButtonSearch } from "./components/buttonSearch";
import { ButtonTree } from "./components/buttonTree";

export function Selector({
  selected,
  setSelected,
  needsRefresh,
  position,
}: {
  selected: Accessor<FrameName>;
  setSelected: Setter<FrameName>;
  needsRefresh: Accessor<boolean>;
  position: "top" | "bottom";
}) {
  return (
    // <div
    //   class={classPropToString([
    //     env.standalone && "pb-8 md:pb-3",
    //     "flex flex-col justify-around bg-black bg-black/85 p-3 backdrop-blur",
    //   ])}
    // >
    <>
      <Show when={position === "top"}>
        <AnchorLogo />
      </Show>

      <ButtonChart selected={selected} setSelected={setSelected} />

      <Show when={position === "bottom"}>
        <ButtonTree selected={selected} setSelected={setSelected} />
        <ButtonFavorites selected={selected} setSelected={setSelected} />
        <ButtonSearch selected={selected} setSelected={setSelected} />
        <ButtonHistory selected={selected} setSelected={setSelected} />
      </Show>

      <Button
        selected={() => selected() === "Settings"}
        onClick={() => {
          setSelected("Settings");
        }}
        icon={() =>
          selected() === "Settings"
            ? IconTablerAssemblyFilled
            : IconTablerAssembly
        }
      />

      <Show when={position === "top"}>
        <div class="hidden size-full md:block" />
      </Show>

      <Show when={needsRefresh()}>
        <ButtonRefresh />
      </Show>

      <Show when={position === "top"}>
        <Anchor icon={() => IconTablerApi} href="/routes" />
        <Anchor
          icon={() => IconTablerFeather}
          href="https://primal.net/p/npub1jagmm3x39lmwfnrtvxcs9ac7g300y3dusv9lgzhk2e4x5frpxlrqa73v44"
        />
        <Anchor
          icon={() => IconTablerGitMerge}
          href="https://github.com/satonomics-org"
        />

        <Anchor icon={() => IconTablerHome2} href="https://satonomics.xyz" />
      </Show>
    </>
    // </div>
  );
}
