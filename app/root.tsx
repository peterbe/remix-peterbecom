import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

import { Footer } from "~/components/footer";

import { GoogleAnalytics } from "./utils/googleanalytics";
// import { ThemeToggler, useTheme } from "./utils/theme-toggler";

export const loader = async () => {
  return json({ gaTrackingId: process.env.GA_TRACKING_ID });
};

export default function App() {
  const { gaTrackingId } = useLoaderData<typeof loader>();

  // const { theme, setTheme } = useTheme();

  return (
    // <html lang="en" data-theme={theme || undefined}>
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.manifest" />
        <Meta />
        <Links />
        <GoogleAnalytics gaTrackingId={gaTrackingId} />
      </head>
      <body>
        <main className="container">
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </main>

        <Footer />

        {/* <ThemeToggler theme={theme} setTheme={setTheme} /> */}
      </body>
    </html>
  );
}

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

  return (
    <html>
      <body style={{ margin: 40, fontFamily: "sans-serif" }}>
        <h1>{pageNotFound ? "Page not found" : "Error"}</h1>

        <p>Something went wrong.</p>
        <pre>{errorMessage}</pre>
      </body>
    </html>
  );
}
