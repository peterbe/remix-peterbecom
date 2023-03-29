import type { V2_MetaFunction } from "@remix-run/node";
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

import { Footer } from "~/components/footer";

import { GoogleAnalytics } from "./utils/googleanalytics";
import { ThemeToggler, useTheme } from "./utils/theme-toggler";

// export const meta: V2_MetaFunction = () => {
//   return [{ charset: "utf-8", viewport: "width=device-width,initial-scale=1" }];
// };

export const loader = async () => {
  return json({ gaTrackingId: process.env.GA_TRACKING_ID });
};

export default function App() {
  const { gaTrackingId } = useLoaderData<typeof loader>();

  const { theme, setTheme } = useTheme();

  return (
    <html lang="en" data-theme={theme || undefined}>
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

        <ThemeToggler theme={theme} setTheme={setTheme} />
      </body>
    </html>
  );
}
