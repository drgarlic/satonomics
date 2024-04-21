import { createResourceWS } from "./base";
import { krakenAPI } from "./kraken";

export const createResourcesWS = () => {
  const resources: ResourcesWS = {
    liveCandle: createResourceWS(krakenAPI.createLiveCandleWebsocket),
  };

  resources.liveCandle.open();

  return resources;
};
