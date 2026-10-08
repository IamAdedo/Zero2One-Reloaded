import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths(), tanstackStart(), react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    headers: {
      // Required for SharedArrayBuffer (Pyodide / WASM runners)
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@monaco-editor/react",
      "@uiw/react-codemirror",
      "@codemirror/lang-javascript",
      "@codemirror/lang-python",
      "@codemirror/theme-one-dark",
      "lucide-react",
      "zustand",
      "cmdk",
      "sonner",
      "canvas-confetti",
      "recharts",
    ],
  },
});
