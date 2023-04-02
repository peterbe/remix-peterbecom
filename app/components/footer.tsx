import { Link, useLocation } from "@remix-run/react";

import { links } from "~/components/nav";

const THIS_YEAR = new Date().getFullYear();

export function Footer() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/plog/blogitem-040601-1")) {
    return <LyricspostFooter />;
  }

  return (
    <footer className="container footer">
      <div className="grid">
        {links.map(([to, text]) => {
          return (
            <div key={to}>
              <Link
                to={to}
                className={pathname === to ? "secondary" : undefined}
              >
                {text}
              </Link>
            </div>
          );
        })}
      </div>
      <p>&copy; peterbe.com 2003 - {THIS_YEAR}</p>
      <p>
        Check out my side project:{" "}
        <a href="https://thatsgroce.web.app" title="That's Groce!">
          That&apos;s Groce!
        </a>
      </p>
    </footer>
  );
}

function LyricspostFooter() {
  return (
    <footer className="container footer">
      <p>
        &copy; <Link to="/">peterbe.com</Link> 2003 - {THIS_YEAR}
      </p>
    </footer>
  );
}
