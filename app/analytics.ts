import { useLocation } from "@remix-run/react";
import { useEffect } from "react";

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
      referrer: document.referrer === location.href ? "" : document.referrer,
      created: new Date().toISOString(),
    };
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

export function useSendPageview() {
  const { pathname } = useLocation();

  useEffect(() => {
    sendEvent("pageview", { pathname });
  }, [pathname]);
}
