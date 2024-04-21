export function ScrollableFrame(
  props: ParentProps & {
    hidden?: Accessor<boolean>;
  },
) {
  return (
    <div
      class="relative flex-1 overflow-y-auto border-b border-white bg-black/95 backdrop-blur-sm"
      style={{
        display: props.hidden?.() ? "none" : undefined,
        "border-bottom-width": !props.hidden ? "0px" : undefined,
      }}
    >
      {props.children}

      <div class="min-h-[95%] border-t border-dashed border-white" />
    </div>
  );
}
