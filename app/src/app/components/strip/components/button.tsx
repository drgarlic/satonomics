import { Clickable } from "./clickable";

export function Button(
  args: {
    selected?: Accessor<boolean>;
    onClick?: VoidFunction;
    icon?: () => ValidComponent;
    hideOnDesktop?: boolean;
    hideOnMobile?: boolean;
  } & ParentProps,
) {
  return <Clickable {...args} />;
}
