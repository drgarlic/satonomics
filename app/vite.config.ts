// @ts-ignore
import { fileURLToPath } from "url";
import autoprefixer from "autoprefixer";
import { visualizer } from "rollup-plugin-visualizer";
import tailwindcss from "tailwindcss";
import unpluginAutoImport from "unplugin-auto-import/vite";
import unpluginIconsResolver from "unplugin-icons/resolver";
import unpluginIcons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import solidPlugin from "vite-plugin-solid";

import packageJSON from "./package.json";

const black = "#000000";
const appName = packageJSON.name[0].toUpperCase() + packageJSON.name.slice(1);

export default defineConfig({
  plugins: [
    solidPlugin(),

    VitePWA({
      injectRegister: false,
      // devOptions: {
      //   enabled: true,
      // },
      pwaAssets: {
        config: true,
        overrideManifestIcons: true,
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,woff2,ttf,md}"],
      },
      manifest: {
        name: appName,
        short_name: appName,
        description: packageJSON.description,
        start_url: "/",
        display: "standalone",
        theme_color: black,
        background_color: black,
        lang: "en",
      },
    }),

    unpluginAutoImport({
      imports: ["solid-js", "@solidjs/router"],
      dts: "./src/types/auto-imports.d.ts",
      resolvers: [
        unpluginIconsResolver({
          prefix: "Icon",
          extension: "jsx",
        }),
      ],
    }),

    unpluginIcons({ autoInstall: true, compiler: "solid" }),

    visualizer({
      template: "treemap",
      filename: "./visualizer/treemap.html",
    }),

    visualizer({
      template: "network",
      filename: "./visualizer/network.html",
    }),

    visualizer({
      template: "sunburst",
      filename: "./visualizer/sunburst.html",
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "/src": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    postcss: {
      plugins: [autoprefixer(), tailwindcss()],
    },
  },
});
