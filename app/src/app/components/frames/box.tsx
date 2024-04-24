import { classPropToString } from "/src/solid";

export function Box({
  flex = true,
  absolute,
  padded = true,
  children,
  dark,
  overflowY,
}: {
  flex?: boolean;
  absolute?: "top" | "bottom";
  padded?: boolean;
  dark?: boolean;
  overflowY?: boolean;
} & ParentProps) {
  return (
    <div
      class={classPropToString([
        "p-2",
        absolute && [
          "absolute inset-x-0",
          absolute === "top"
            ? "top-0"
            : "pointer-events-none bottom-0 bg-gradient-to-b from-transparent to-black",
        ],
      ])}
    >
      <div
        class={classPropToString([
          "rounded-xl border border-orange-200/10 shadow-md",
          flex && "flex w-full space-x-2",
          overflowY ? "overflow-y-auto" : "overflow-hidden",
          dark
            ? "bg-orange-100/5 backdrop-blur-sm"
            : "bg-orange-200/10 backdrop-blur-md",
          padded && "p-1.5",
        ])}
      >
        {children}
      </div>
    </div>
  );
}
