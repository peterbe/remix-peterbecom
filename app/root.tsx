import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Footer } from "~/components/footer";
import { Screensaver } from "~/components/screensaver";
import { SkipToNav } from "~/components/skip-to-nav";

import { useSendError } from "./analytics";

const queryClient = new QueryClient();

export const loader = async () => {
  const screensaverLazyStartSeconds = process.env.SCREENSAVER_LAZY_START_SECONDS
    ? parseInt(process.env.SCREENSAVER_LAZY_START_SECONDS)
    : 60 * 30; // 30 minutes by default
  return json({
    screensaverLazyStartSeconds,
  });
};

export default function App() {
  const { screensaverLazyStartSeconds } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.manifest" />
        <Meta />
        <Links />
      </head>
      <body>
        <SkipToNav />
        <main className="container">
          <QueryClientProvider client={queryClient}>
            <Outlet />
          </QueryClientProvider>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </main>

        <Footer />
        <Screensaver lazyStartSeconds={screensaverLazyStartSeconds} />
      </body>
    </html>
  );
}

// I *think* this never executes on the server.
// And if you remove this, it won't fall back on the ErrorBoundary
// exported in routes/_index.tsx.
export function ErrorBoundary() {
  const error = useRouteError();

  console.log("In root.tsx error", error, {
    isRouteErrorResponse: isRouteErrorResponse(error),
  });

  let pageNotFound = false;
  if (isRouteErrorResponse(error)) {
    pageNotFound = error.status >= 400 && error.status < 500;
  }

  let errorMessage = "Unknown error";
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  useSendError(errorMessage);

  return (
    <html>
      <body style={{ margin: 40, fontFamily: "sans-serif" }}>
        <h1>{pageNotFound ? "Page not found" : "Error"}</h1>

        <p>Something went wrong in root error boundary.</p>
        <pre>{errorMessage}</pre>

        <p>
          I'm sorry this happened. Hopefully the automated error reporting will
          make this problem go away in the near future.
        </p>
        <p style={{ fontWeight: "bold" }}>
          <a href="">Reload the page</a>
        </p>
        <p>
          If it persists, consider <a href="/contact">emailing me</a>.
        </p>
      </body>
    </html>
  );
}
