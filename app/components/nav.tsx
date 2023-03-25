import { useLocation } from "@remix-run/react";
import { Link } from "@remix-run/react";
import type { ReactNode } from "react";

type Props = {
  title?: string;
  subHead?: string | ReactNode;
};

export const links = [
  ["/", "Home"],
  ["/plog", "Archive"],
  ["/about", "About"],
  ["/contact", "Contact"],
  ["/search", "Search"],
];

export function Nav({
  title = "Peterbe.com",
  subHead = "Peter Bengtsson's blog",
}: Props) {
  const { pathname } = useLocation();

  return (
    <div className="grid nav-grid">
      <div>
        <hgroup>
          <h1>{title}</h1>
          <h2>{subHead}</h2>
        </hgroup>
      </div>
      <div>
        <nav>
          <ul>
            {links
              .filter(([to]) => {
                if (to === "/" && pathname === "/") return false;
                return true;
              })
              .map(([to, text]) => {
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      className={pathname === to ? "secondary" : undefined}
                    >
                      {text}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
