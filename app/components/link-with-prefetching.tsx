import { Link } from "@remix-run/react";
import type { RemixLinkProps } from "@remix-run/react/dist/components";

interface Props extends RemixLinkProps {
  instant?: boolean;
}

// The regular `Link` component from Remix has built in support for prefetching
// with the `prefetch={"intent" | "render" | "none"}` prop.
// Unfortunately, it assumes that you will do a regular click on the link.
// A lot of people right-click and "Open in a new tab" and then they'll
// never load the XHR fetches necessary.
// However, in the case of the variable `instant` prop, we can at least
// control it.
export function LinkWithPrefetching({ to, children, instant = false }: Props) {
  const href = to.toString();

  return (
    <>
      {/* When the user right-clicks to open in a new tab */}
      {instant && <link rel="prefetch" href={href} />}

      <Link to={to} viewTransition prefetch={instant ? "render" : "intent"}>
        {children}
      </Link>
    </>
  );
}
