/* @refresh reload */
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { render } from "solid-js/web";

import "./styles/main.css";

import { App } from "./app";
import { createDatasets } from "./scripts";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(() => {
  const datasets = createDatasets();

  return (
    <MetaProvider>
      <Router>
        <Route
          path="/routes"
          component={() => (
            <div class="flex h-dvh flex-col gap-3 overflow-y-auto p-2">
              <For each={Object.entries(datasets.date)}>
                {([resourceName, resource]) => (
                  <Show when={"url" in resource ? resource : undefined}>
                    {(resource) => (
                      <p>
                        {`${"date"} - ${resourceName}`}:
                        <a
                          href={resource().url.toString()}
                          target="_blank"
                          class="ml-1 break-words text-orange-500 visited:text-orange-700 hover:text-orange-300"
                        >
                          {resource().url.toString()}
                        </a>
                      </p>
                    )}
                  </Show>
                )}
              </For>
              <For each={Object.entries(datasets.height)}>
                {([resourceName, resource]) => (
                  <Show when={"url" in resource ? resource : undefined}>
                    {(resource) => (
                      <p>
                        {`${"height"} - ${resourceName}`}:
                        <a
                          href={resource().url.toString()}
                          target="_blank"
                          class="ml-1 break-words text-orange-500 visited:text-orange-700 hover:text-orange-300"
                        >
                          {resource().url.toString()}
                        </a>
                      </p>
                    )}
                  </Show>
                )}
              </For>
            </div>
          )}
        />
        <Route path="/:preset?" component={() => <App datasets={datasets} />} />
      </Router>
    </MetaProvider>
  );
}, root!);
