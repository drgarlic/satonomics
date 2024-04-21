export function Counter({
  count,
  name,
  setRef,
}: {
  count: () => number;
  name: string;
  setRef?: Setter<HTMLDivElement | undefined>;
}) {
  return (
    <div
      ref={setRef}
      class="border-b border-white px-3 py-1.5"
      style={{
        "border-style": count() ? "dashed" : "none",
      }}
    >
      Counted <span class="font-bold">{count().toLocaleString("en-us")}</span>{" "}
      {name}
    </div>
  );
}
