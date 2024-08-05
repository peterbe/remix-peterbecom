import type { MetaFunction } from "@remix-run/node";

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

export const meta: MetaFunction = () => {
  return [
    {
      title: "About Peterbe.com",
    },
    {
      name: "description",
      content:
        "My name is Peter Bengtsson and I'm a web developer. This is my personal blog.",
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
