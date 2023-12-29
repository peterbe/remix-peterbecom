import { useLocation } from "@remix-run/react";
import { lazy, Suspense, useEffect, useState } from "react";

const ConfettiLazy = lazy(
  // @ts-ignore
  () => import("~/components/confetti-screensaver"),
);

const LAZY_START_SECONDS = 30;

export function Screensaver() {
  const [loadScreensaver, setLoadScreensaver] = useState(false);
  useEffect(() => {
    window.setTimeout(() => {
      setLoadScreensaver(true);
    }, LAZY_START_SECONDS * 1000);
  }, []);

  const { pathname } = useLocation();
  if (pathname.startsWith("/plog/blogitem-040601-1")) {
    return null;
  }

  return (
    <div>
      {loadScreensaver && (
        <Suspense fallback={null}>
          <ConfettiLazy />
        </Suspense>
      )}
    </div>
  );
}
