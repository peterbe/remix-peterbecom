import pico from "@picocss/pico/css/pico.css";
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

import styles from "~/styles/globals.css";
import highlight from "~/styles/highlight.css";
import homepage from "~/styles/homepage.css";

import { GoogleAnalytics } from "./utils/googleanalytics";
import { ThemeToggler, useTheme } from "./utils/theme-toggler";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  // title: "Peterbe.com",
  viewport: "width=device-width,initial-scale=1",
});

export function links() {
  return [
    { rel: "stylesheet", href: pico },
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: highlight },
    { rel: "stylesheet", href: homepage },
  ];
}

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
