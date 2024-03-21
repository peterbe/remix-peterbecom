import { useLocation } from "@remix-run/react";
import { lazy, Suspense, useEffect, useState } from "react";

const ConfettiLazy = lazy(
  // @ts-ignore
  () => import("~/components/confetti-screensaver"),
);

const LAZY_START_SECONDS = 60;

export function Screensaver() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/plog/blogitem-040601-1")) {
    return null;
  }
  return <DelayedScreensaver />;
}

function DelayedScreensaver() {
  const [loadScreensaver, setLoadScreensaver] = useState(false);
  useEffect(() => {
    const startWaiting = () => {
      return window.setTimeout(() => {
        setLoadScreensaver(true);
      }, LAZY_START_SECONDS * 1000);
    };

    let timer = startWaiting();
    function restartWaiting() {
      window.clearTimeout(timer);
      timer = startWaiting();
    }
    let throttle = false;
    function delayLazyStart() {
      if (!throttle) {
        restartWaiting();
        throttle = true;
        setTimeout(() => {
          throttle = false;
        }, 1000);
      }
    }

    window.addEventListener("scroll", delayLazyStart);
    return () => {
      window.removeEventListener("scroll", delayLazyStart);
    };
  }, []);

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
