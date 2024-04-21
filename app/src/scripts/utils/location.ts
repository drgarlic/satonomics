import { useLocation } from "@solidjs/router";

export const addLocationToID = (id: string) =>
  `${useLocation().pathname.slice(1) || "home"}-${id}`;
