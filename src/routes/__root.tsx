import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/supabase/auth";
import { AuthButton } from "@/components/layout/AuthButton";

interface RouterContext {
  queryClient: QueryClient;
}

const queryClient = new QueryClient();

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "description",
        content:
          "Zero2One Reloaded — test-driven tech learning: concept lessons, hands-on drills, career tracks.",
      },
      { title: "Zero2One Reloaded — 0→1 Engineering Mastery" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
          <header className="border-b border-border">
            <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
              <Link
                to="/"
                className="font-mono text-lg font-bold text-primary"
              >
                0&#10148;1
              </Link>
              <span className="text-sm text-muted-foreground">
                Zero2One Reloaded
              </span>
              <span className="ml-auto">
                <AuthButton />
              </span>
            </nav>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8">
            <Outlet />
          </main>
          <footer className="border-t border-border">
            <p className="mx-auto max-w-5xl px-4 py-4 font-mono text-xs text-muted-foreground">
              Zero2One Reloaded — concept first, drill second.
            </p>
          </footer>
          </AuthProvider>
        </QueryClientProvider>
        <Toaster richColors position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
