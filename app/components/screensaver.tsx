import { useLocation } from "@remix-run/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

const ConfettiLazy = lazy(
  // @ts-ignore
  () => import("~/components/confetti-screensaver"),
);

type Props = {
  lazyStartSeconds: number;
};
export function Screensaver({ lazyStartSeconds }: Props) {
  const { pathname } = useLocation();
  if (pathname.startsWith("/plog/blogitem-040601-1")) {
    return null;
  }
  return <DelayedScreensaver lazyStartSeconds={lazyStartSeconds} />;
}

function DelayedScreensaver({ lazyStartSeconds }: Props) {
  const [loadScreensaver, setLoadScreensaver] = useState(false);
  useEffect(() => {
    const startWaiting = () => {
      return window.setTimeout(() => {
        setLoadScreensaver(true);
      }, lazyStartSeconds * 1000);
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
          <ErrorBoundary fallback={null}>
            <ConfettiLazy />
          </ErrorBoundary>
        </Suspense>
      )}
    </div>
  );
}
