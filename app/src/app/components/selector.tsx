import { classPropToString } from "/src/solid";

export function Selector({
  selected,
  setSelected,
}: {
  selected: Accessor<FrameName>;
  setSelected: Setter<FrameName>;
}) {
  return (
    // <div
    //   class={classPropToString([
    //     env.standalone && "pb-8 md:pb-3",
    //     "flex flex-col justify-around bg-black bg-black/85 p-3 backdrop-blur",
    //   ])}
    // >
    <>
      <a
        class="inline-flex justify-center rounded-lg bg-orange-600 p-4"
        href="https://satonomics.xyz"
      >
        <svg
          class="-m-1.5 size-7"
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
          fill="white"
        >
          <g transform="matrix(1.14102,0,0,2.63158,-0.849652,5.12904)">
            <rect x="4.25" y="3.751" width="14.023" height="1.52" />
          </g>
          <g transform="matrix(1.14102,0,0,2.63158,-0.849652,0.129039)">
            <rect x="4.25" y="3.751" width="14.023" height="1.52" />
          </g>
          <g transform="matrix(1.14102,0,0,2.63158,-0.849652,-4.87096)">
            <rect x="4.25" y="3.751" width="14.023" height="1.52" />
          </g>
          <g transform="matrix(0.285256,0,0,2.63158,8.78759,-9.87096)">
            <rect x="4.25" y="3.751" width="14.023" height="1.52" />
          </g>
          <g transform="matrix(0.285256,0,0,2.63158,8.78759,10.129)">
            <rect x="4.25" y="3.751" width="14.023" height="1.52" />
          </g>
        </svg>
      </a>
      <Button
        selected={() => selected() === "Chart"}
        onClick={() => {
          setSelected("Chart");
        }}
        icon={() =>
          selected() === "Chart"
            ? IconTablerChartAreaFilled
            : IconTablerChartLine
        }
        hideOnDesktop
      />
      <Button
        selected={() => selected() === "Tree"}
        onClick={() => {
          setSelected("Tree");
        }}
        icon={() =>
          selected() === "Tree" ? IconTablerFolderFilled : IconTablerFolder
        }
      />
      <Button
        selected={() => selected() === "Favorites"}
        onClick={() => {
          setSelected("Favorites");
        }}
        icon={() =>
          selected() === "Favorites" ? IconTablerStarFilled : IconTablerStar
        }
      />
      <Button
        selected={() => selected() === "Search"}
        onClick={() => {
          setSelected("Search");
        }}
        icon={() =>
          selected() === "Search" ? IconTablerZoomFilled : IconTablerSearch
        }
      />

      <div class="h-full" />

      {/* <Button
        icon={() => IconTablerChevronRight}
      /> */}

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

      {/* <Button icon={() => IconTablerApi} /> */}
      {/* <Button icon={() => IconTablerFeather} /> */}
      {/* <Button icon={() => IconTablerGitMerge} /> */}
      {/* <Button icon={() => IconTablerAnalyze} /> */}
      {/* <Button icon={() => IconTablerHome2} /> */}

      {/* <div class="border-t border-dashed border-white" />
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
      /> */}
    </>
    // </div>
  );
}

function Button({
  selected,
  onClick,
  icon,
  hideOnDesktop,
}: {
  selected?: Accessor<boolean>;
  onClick?: VoidFunction;
  icon: () => ValidComponent;
  hideOnDesktop?: boolean;
}) {
  return (
    <button
      class={classPropToString([
        selected?.() ? "bg-orange-200/10" : "opacity-50 hover:bg-orange-200/10",
        hideOnDesktop ? "md:hidden" : "",
        "select-none rounded-lg p-3.5 hover:text-orange-400 hover:opacity-100 active:scale-90",
      ])}
      onClick={onClick}
    >
      <Dynamic component={icon()} class={classPropToString(["size-5"])} />
    </button>
  );
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
