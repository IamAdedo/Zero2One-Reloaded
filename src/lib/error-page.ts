/**
 * Minimal catastrophic-error page (static HTML, no React dependency so it
 * renders even when SSR itself is broken).
 */
export function renderErrorPage(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Zero2One — Something went wrong</title>
<style>body{background:#05070d;color:#e6edf3;font-family:ui-monospace,monospace;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}a{color:#22d3ee}</style>
</head><body><main><h1>0&#10148;1 — Something went wrong</h1>
<p>The server hit an unexpected error. <a href="/">Return home</a></p></main></body></html>`;
}
