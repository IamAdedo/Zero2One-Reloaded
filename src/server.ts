import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (
    request: Request,
    env: unknown,
    ctx: unknown,
  ) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await secureCrossOriginHeaders(request, response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

const CROSS_ORIGIN_HEADERS = {
  "cross-origin-embedder-policy": "require-corp",
  "cross-origin-opener-policy": "same-origin",
} as const;

async function secureCrossOriginHeaders(
  request: Request,
  response: Response,
): Promise<Response> {
  const accept = request.headers.get("accept") ?? "";
  const isNavigation =
    request.method === "GET" && accept.includes("text/html");
  if (!isNavigation) return response;

  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CROSS_ORIGIN_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
