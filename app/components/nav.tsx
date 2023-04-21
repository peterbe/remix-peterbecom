import { useLocation, useNavigate } from "@remix-run/react";
import { Link } from "@remix-run/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useState } from "react";

import { ModalSearch } from "./modal-search";

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
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }
      if (e.key === "/") {
        setOpen(true);
        e.preventDefault();
        return;
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [navigate]);

  return (
    <div id="nav">
      <h1>{title}</h1>

      <div className="grid nav-grid">
        <div>
          <div>{subHead}</div>
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
                        title={
                          to === "/search" ? `Shortcut key: '/'` : undefined
                        }
                        onClick={(event) => {
                          if (to === "/search") {
                            event.preventDefault();
                            setOpen(true);
                          }
                        }}
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

      {open && (
        <ModalSearch
          onClose={(url?: string) => {
            if (url) {
              navigate(url);
            }
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
