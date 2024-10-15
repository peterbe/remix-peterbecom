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

  function onMouseOver() {
    setSoon(true);
  }

  function onMouseOut() {
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
      {(preload || instant) && <PrefetchPageLinks page={to} />}
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
