export const classPropToString = (classes?: ClassProp): string =>
  Array.isArray(classes)
    ? (
        classes
          .map((c) => (Array.isArray(c) ? classPropToString(c) : c))
          .filter((c) => c) as string[]
      )
        .map((c) => c.trim())
        .join(" ")
        .trim()
    : classes || "";
