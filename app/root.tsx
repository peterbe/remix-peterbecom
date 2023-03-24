import type { MetaFunction } from "@remix-run/node";
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

import { GoogleAnalytics } from "./utils/googleanalytics";
import { ThemeToggler, useTheme } from "./utils/theme-toggler";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  // title: "Peterbe.com",
  viewport: "width=device-width,initial-scale=1",
});

export const loader = async () => {
  return json({ gaTrackingId: process.env.GA_TRACKING_ID });
};

export default function App() {
  const { gaTrackingId } = useLoaderData<typeof loader>();

  const { theme, setTheme } = useTheme();

  return (
    <html lang="en" data-theme={theme || undefined}>
      <head>
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
        <ThemeToggler theme={theme} setTheme={setTheme} />
      </body>
    </html>
  );
}
