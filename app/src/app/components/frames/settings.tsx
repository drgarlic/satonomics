import { ScrollableFrame } from "./scrollable";

export function SettingsFrame({
  marquee,
  selectedFrame,
}: {
  marquee: ASS<boolean>;
  selectedFrame: Accessor<FrameName>;
}) {
  const value = marquee();

  return (
    <ScrollableFrame hidden={() => selectedFrame() !== "Settings"}>
      <div class="space-y-4 p-3">
        <div class="space-y-2">
          <p>Explorer</p>
          <div>Preset right side</div>
          <div>Opened group right side</div>
          <div>Closed group right side</div>
        </div>
        <div class="space-y-2">
          <p>Background</p>
          <div>Opacity</div>
          <div>Scroll</div>
        </div>
        <div class="space-y-2">
          <p>Chart</p>
          <div>Right scale</div>
        </div>
        <div>
          <label class="switch">
            Marquee
            <input
              type="checkbox"
              checked={value}
              onChange={(event) => marquee.set(event.target.checked || false)}
            />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </ScrollableFrame>
  );
}
