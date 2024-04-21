import { defineConfig } from "@vite-pwa/assets-generator/config";

const black = "#000000";

export default defineConfig({
  // https://github.com/vite-pwa/assets-generator/blob/main/src/presets/minimal-2023.ts
  // but in black
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[48, "favicon.ico"]],
    },
    maskable: {
      sizes: [512],
      resizeOptions: {
        background: black,
      },
    },
    apple: {
      sizes: [180],
      resizeOptions: {
        background: black,
      },
    },
  },
  images: ["public/favicon.svg"],
});
