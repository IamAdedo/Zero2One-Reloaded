import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

/**
 * TanStack Start serves SSR responses through its own handler, bypassing
 * Vite's `server.headers` — so COOP/COEP are enforced here for dev, and in
 * `src/server.ts` for production. Both are required for SharedArrayBuffer
 * (Pyodide / WASM runners).
 */
function crossOriginIsolation(): Plugin {
  return {
    name: "zero2one-coop-coep",
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    crossOriginIsolation(),
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    tailwindcss(),
    tsconfigPaths(),
    tanstackStart(),
    react(),
  ],
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
