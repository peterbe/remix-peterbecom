import { useLocation } from "@remix-run/react";
import { Link } from "@remix-run/react";

type Props = {
  title?: string;
  subHead?: string;
};

const links = [
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
          <h1>
            {/* <Link to="/">{title}</Link> */}
            {title}
          </h1>
          <h2>{subHead}</h2>
        </hgroup>
      </div>
      <div>
        <nav>
          <ul>
            {pathname !== "/" && (
              <li>
                <Link to="/">Home</Link>
              </li>
            )}
            {links.map(([to, text]) => {
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
