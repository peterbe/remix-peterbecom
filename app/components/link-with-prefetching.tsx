import { Link, PrefetchPageLinks } from "@remix-run/react";
import { useEffect, useState } from "react";

const MOUSEOVER_DELAY = 200; //ms

export function LinkWithPrefetching({
  to,
  children,
  instant = false,
}: {
  to: string;
  children: React.ReactNode;
  instant?: boolean;
}) {
  const [preload, setPreload] = useState(false);
  const [soon, setSoon] = useState(false);

  const prefetch = preload || instant;

  function onMouseOver() {
    if (prefetch) return;
    setSoon(true);
  }

  function onMouseOut() {
    if (prefetch) return;
    setSoon(false);
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (soon) {
      timer = setTimeout(() => {
        setPreload(true);
      }, MOUSEOVER_DELAY);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [soon]);

  return (
    <>
      {/* When the user right-clicks to open in a new tab */}
      {prefetch && <link rel="prefetch" href={to} />}

      {/* When the user single-clicks on the link */}
      {prefetch && <PrefetchPageLinks page={to} />}

      <Link
        to={to}
        viewTransition
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      >
        {children}
      </Link>
    </>
  );
}
