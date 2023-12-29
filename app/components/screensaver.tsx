import { useLocation } from "@remix-run/react";
import { lazy, Suspense, useEffect, useState } from "react";

const ConfettiLazy = lazy(
  // @ts-ignore
  () => import("~/components/confetti-screensaver"),
);

export function Screensaver() {
  const [loadScreensaver, setLoadScreensaver] = useState(false);
  useEffect(() => {
    window.setTimeout(() => {
      setLoadScreensaver(true);
    }, 10000);
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
