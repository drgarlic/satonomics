import { Line } from "./line";

export function File({
  id,
  name,
  icon,
  active,
  depth,
  onClick,
  favorite,
  visited,
}: {
  id: string;
  name: string;
  icon: JSXElement;
  active: Accessor<boolean>;
  depth: number;
  onClick: VoidFunction;
  favorite: Accessor<boolean>;
  visited: Accessor<boolean>;
}) {
  const absolute = createMemo(() =>
    favorite() ? (
      <span class="rounded-full bg-yellow-950 p-1">
        <IconTablerStarFilled class="size-3 text-amber-500" />
      </span>
    ) : !visited() ? (
      <span
        class="rounded-full px-1.5 py-0.5 text-xs font-black text-black"
        style={{
          "font-size": "0.625rem",
          background: `linear-gradient(
            ${randomDegree()}deg,
            rgba(235, 243, 208, 1) 0%,
            rgba(235, 243, 208, 0) 18%
          ),
          radial-gradient(
            30% 71% at 44% 87%,
            rgba(220, 141, 220, 1) 0%,
            rgba(220, 141, 220, 0) 100%
          ),
          radial-gradient(
            34% 54% at 36% 100%,
            rgba(220, 141, 220, 1) 0%,
            rgba(220, 141, 220, 0) 100%
          ),
          radial-gradient(
            43% 50% at 46% 45%,
            rgba(203, 173, 235, 1) 0%,
            rgba(194, 166, 241, 0) 100%
          ),
          linear-gradient(
            ${randomDegree()}deg,
            rgba(205, 249, 232, 1) 21%,
            rgba(205, 249, 232, 0) 48%
          ),
          linear-gradient(
            ${randomDegree()}deg,
            rgba(192, 169, 240, 0) 0%,
            rgba(192, 169, 240, 1) 1%,
            rgba(192, 169, 240, 0) 17%
          ),
          linear-gradient(
            ${randomDegree()}deg,
            rgba(192, 169, 240, 0) 29%,
            rgba(192, 169, 240, 1) 38%,
            rgba(192, 169, 240, 0) 50%
          ),
          radial-gradient(
            41% 97% at 91% 40%,
            rgba(255, 253, 177, 1) 0%,
            rgba(254, 228, 191, 1) 34%,
            rgba(240, 189, 208, 1) 70%,
            rgba(225, 129, 38, 0) 100%
          ),
          linear-gradient(
            ${randomDegree()}deg,
            rgba(194, 166, 241, 1) 0%,
            rgba(194, 166, 241, 1) 100%
          )`,
        }}
      >
        NEW
      </span>
    ) : undefined,
  );

  return (
    <Line
      id={id}
      depth={depth}
      active={active}
      name={name}
      icon={() => icon}
      onClick={onClick}
      absolute={absolute}
    />
  );
}

function randomDegree(min = 0, max = 360) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
