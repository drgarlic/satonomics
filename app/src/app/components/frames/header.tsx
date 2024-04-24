export function Header({ title, children }: { title: string } & ParentProps) {
  return (
    <div>
      <h3 class="text-xl font-bold">{title}</h3>
      <p class="text-orange-100/75">{children}</p>
    </div>
  );
}
