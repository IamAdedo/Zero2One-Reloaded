import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

declare global {
  interface Window {
    __zero2one_reloaded_hydrated__?: boolean;
  }
}

if (typeof window !== "undefined" && !window.__zero2one_reloaded_hydrated__) {
  window.__zero2one_reloaded_hydrated__ = true;
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <StartClient />
      </StrictMode>,
    );
  });
}
