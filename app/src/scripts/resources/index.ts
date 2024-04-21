import { createResourcesWS } from "./ws";

export const createResources = () => {
  const resources: Resources = {
    ws: createResourcesWS(),
  };

  return resources;
};
