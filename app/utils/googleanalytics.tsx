import { useEffect } from "react";
import { useLocation } from "@remix-run/react";

import * as gtag from "~/utils/gtags.client";

export function GoogleAnalytics({ gaTrackingId }: { gaTrackingId?: string }) {
  const location = useLocation();
  useEffect(() => {
    if (gaTrackingId && process.env.NODE_ENV !== "development") {
      gtag.pageview(location.pathname, gaTrackingId);
    }
  }, [location, gaTrackingId]);

  if (process.env.NODE_ENV === "development" || !gaTrackingId) {
    return null;
  }
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
      />
      <script
        async
        id="gtag-init"
        dangerouslySetInnerHTML={{
          __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaTrackingId}', {
                page_path: window.location.pathname,
              });
            `,
        }}
      />
    </>
  );
}
