import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Two HTML entry points: index.html is the action popover (roster),
// modal.html is the larger sheet editor opened via OBR.modal.open().
//
// `base` is only set for production builds because the GitHub Pages
// deployment serves this project from a subpath
// (https://<user>.github.io/fate-rpg/) rather than domain root. Leaving
// dev's base at "/" keeps the local `npm run dev` URL (and the README's
// manifest-loading instructions) unchanged. manifest.json itself uses
// filename-only (no leading slash) paths so it resolves correctly under
// either base without needing its own copy of this logic.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/fate-rpg/" : "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        modal: resolve(__dirname, "modal.html"),
      },
    },
  },
}));
