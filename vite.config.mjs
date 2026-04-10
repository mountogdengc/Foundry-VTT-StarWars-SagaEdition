import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "src/swse.mjs"),
      formats: ["es"],
      fileName: "swse",
    },
    rollupOptions: {
      output: {
        assetFileNames: "swse.[ext]",
      },
    },
  },
});
