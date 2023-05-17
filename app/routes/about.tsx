import type { V2_MetaFunction } from "@remix-run/node";

import { About } from "~/components/about";
import styles from "~/styles/about.css";
import { absoluteURL } from "~/utils/utils";

import { links as rootLinks } from "./_index";

export function links() {
  return [
    ...rootLinks().filter((x) => !x.extra),
    { rel: "stylesheet", href: styles },
    { rel: "canonical", href: absoluteURL("/about") },
  ];
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "About Peterbe.com",
    },
  ];
};

export function headers() {
  const seconds = 60 * 60 * 12;
  return {
    "cache-control": `public, max-age=${seconds}`,
  };
}

export default function View() {
  return <About />;
}
