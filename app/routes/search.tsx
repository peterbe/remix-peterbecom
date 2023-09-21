import type { MetaFunction } from "@remix-run/node";

import { Search } from "~/components/search";
import search from "~/styles/search.css";
import { absoluteURL } from "~/utils/utils";

import { links as rootLinks } from "./_index";

export function links() {
  return [
    ...rootLinks().filter((x) => !x.extra),
    { rel: "stylesheet", href: search },
    { rel: "canonical", href: absoluteURL("/search") },
  ];
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Searching on Peterbe.com",
    },
  ];
};

export function headers() {
  const seconds = 60 * 60;
  return {
    "cache-control": `public, max-age=${seconds}`,
  };
}

export default function View() {
  return <Search />;
}
