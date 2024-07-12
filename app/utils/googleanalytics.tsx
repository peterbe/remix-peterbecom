import { useLocation } from "@remix-run/react";
import { useEffect } from "react";

import { pageview } from "~/utils/gtags.client";

export function GoogleAnalytics({ gaTrackingId }: { gaTrackingId?: string }) {
  const location = useLocation();
  useEffect(() => {
    if (gaTrackingId && process.env.NODE_ENV !== "development") {
      pageview(location.pathname, gaTrackingId);
    }
  }, [location, gaTrackingId]);

  if (process.env.NODE_ENV === "development" || !gaTrackingId) {
    return null;
  }
  // Based on https://analytics.google.com/analytics/web/#/a94373p359308548/admin/streams/table/4759787800
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments)}
gtag('js', new Date()); gtag('config', '${gaTrackingId}');
            `.trim(),
        }}
      />
    </>
  );
}
