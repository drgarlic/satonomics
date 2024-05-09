import { Clickable } from "./clickable";

export function Anchor(args: { href: string; icon?: () => ValidComponent }) {
  return <Clickable {...args} />;
}
