import { useLocation } from "@remix-run/react";
import { useEffect } from "react";

import { parseUserAgent } from "./user-agent";

function uuidv4(): string {
  try {
    return crypto.randomUUID();
  } catch (err) {
    // https://stackoverflow.com/a/2117523
    return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(
      /[018]/g,
      (c: number) =>
        (
          c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16),
    );
  }
}

type Data = Record<string, string>;

// function round(value: number, decimals = 2) {
//   return Number(value.toFixed(decimals));
// }

// function getPerformance() {
//   const paint = performance
//     ?.getEntriesByType("paint")
//     ?.find(({ name }) => name === "first-contentful-paint");
//   const nav = performance?.getEntriesByType("navigation")?.[0] as
//     | PerformanceNavigationTiming
//     | undefined;
//   return {
//     firstContentfulPaint: paint ? round(paint.startTime) : undefined,
//     domInteractive: nav ? round(nav.domInteractive) : undefined,
//     domComplete: nav ? round(nav.domComplete) : undefined,
//     render: nav ? round(nav.responseEnd - nav.requestStart) : undefined,
//   };
// }

let previousReferrer = "";
function getReferrer(documentReferrer: string) {
  if (
    !documentReferrer &&
    previousReferrer &&
    location.href !== previousReferrer
  ) {
    return previousReferrer;
  }
  return documentReferrer === location.href ? "" : documentReferrer;
}

export function sendEvent(type: string, data: Data) {
  try {
    let uuid = localStorage.getItem("uuid");
    if (!uuid || typeof uuid !== "string") {
      uuid = uuidv4();
      localStorage.setItem("uuid", uuid);
    }
    let sid = sessionStorage.getItem("sid");
    if (!sid || typeof sid !== "string") {
      sid = uuidv4();
      sessionStorage.setItem("sid", sid);
    }

    const meta = {
      uuid,
      sid,
      url: location.href,
      referrer: getReferrer(document.referrer),
      created: new Date().toISOString(),
      // performance: getPerformance(),
      user_agent: parseUserAgent(),
    };
    previousReferrer = location.href;

    const blob = new Blob(
      [
        JSON.stringify({
          type,
          data,
          meta,
        }),
      ],
      {
        type: "application/json",
      },
    );
    navigator.sendBeacon("/events", blob);
  } catch (err) {
    console.warn("sendBeacon failed", err);
  }
}

export function useSendPageview(extra: object | null = null) {
  const { pathname } = useLocation();

  useEffect(() => {
    sendEvent("pageview", Object.assign({}, { pathname }, extra));
  }, [pathname, extra]);
}

export function useSendError(errorMessage: string) {
  const { pathname } = useLocation();

  useEffect(() => {
    sendEvent("error", Object.assign({}, { pathname }, { errorMessage }));
  }, [pathname, errorMessage]);
}
