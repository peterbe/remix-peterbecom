import { useEffect } from "react";

import type { Post } from "~/types";

const PING_DELAY = 800;
type Props = {
  post: Post;
};

export function Ping({ post }: Props) {
  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (!mounted) return;

      const url = document.location.href.split("#")[0] + "/ping";
      const pathname = document.location.pathname.split("/");
      const oid = pathname[pathname.length - 1];
      let pinged: string[] = [];
      try {
        pinged.push(
          ...(window.sessionStorage.getItem("pinged") || "").split("/"),
        );
      } catch (err) {
        console.warn("sessionStorage.getItem() not working", err);
      }
      if (pinged.length > 0 && pinged[0] === oid) return;

      fetch(url, {
        method: "PUT",
      }).then(() => {
        pinged.unshift(oid);
        try {
          window.sessionStorage.setItem("pinged", pinged.join("/"));
        } catch (err) {
          console.warn("sessionStorage.setItem() not working", err);
        }
      });
    }, PING_DELAY);
    return () => {
      mounted = false;
    };
  }, [post]);

  return null;
}
