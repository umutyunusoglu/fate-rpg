import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Two HTML entry points: index.html is the action popover (roster),
// modal.html is the larger sheet editor opened via OBR.modal.open().
//
// `base` is "/fate-rpg/" in both dev and build (not just build) because
// Owlbear resolves manifest.json's `action.icon`/`action.popover` as
// origin + path (a literal string join against the bare domain, dropping
// any path segments -- verified by testing: a path without a leading "/"
// produced "https://<host>index.html" with no separator at all). That
// means these paths must be absolute AND already include this project's
// subdirectory, in every environment, so there is exactly one
// manifest.json instead of dev/prod variants. See public/manifest.json.
export default defineConfig({
  plugins: [react()],
  base: "/fate-rpg/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        modal: resolve(__dirname, "modal.html"),
      },
    },
  },
});
