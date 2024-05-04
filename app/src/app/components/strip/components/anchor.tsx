export function Anchor({
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
