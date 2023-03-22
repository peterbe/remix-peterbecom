// import styles from "@picocss/pico/scss/pico.scss";
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
import { useEffect, useState } from "react";

import styles from "~/styles/globals.css";

import { GoogleAnalytics } from "./utils/googleanalytics";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Peterbe.com",
  viewport: "width=device-width,initial-scale=1",
});

export function links() {
  return [
    { rel: "stylesheet", href: pico },
    { rel: "stylesheet", href: styles },
  ];
}
export const loader = async () => {
  return json({ gaTrackingId: process.env.GA_TRACKING_ID });
};

export default function App() {
  const { gaTrackingId } = useLoaderData<typeof loader>();

  const [theme, setTheme] = useState<null | string>(null);

  useEffect(() => {
    try {
      const pref = localStorage.getItem("theme");
      if (pref === "light" || pref === "dark") setTheme(pref);
    } catch {}
  }, []);

  return (
    <html lang="en" data-theme={theme || undefined}>
      <head>
        <Meta />
        <Links />
        <GoogleAnalytics gaTrackingId={gaTrackingId} />
        {/* <GoogleAnalytics /> */}
      </head>
      <body>
        <main className="container">
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </main>
        <a
          className="theme-toggler"
          href={theme === "dark" ? "#light" : "#dark"}
          role="button"
          onClick={(event) => {
            event.preventDefault();
            console.log({
              natural: window.matchMedia("(prefers-color-scheme: dark)")
                .matches,
            });
            let nextTheme: string | null = theme === "dark" ? "light" : "dark";
            setTheme(nextTheme);
            if (
              nextTheme === "dark" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
            ) {
              try {
                localStorage.removeItem("theme");
              } catch {}
            } else {
              try {
                localStorage.setItem("theme", nextTheme);
              } catch {}
            }
          }}
        >
          toggle theme
        </a>
      </body>
    </html>
  );
}
