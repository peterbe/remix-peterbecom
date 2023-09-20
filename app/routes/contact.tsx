import type { MetaFunction } from "@remix-run/node";

import { Contact } from "~/components/contact";
import styles from "~/styles/contact.css";
import { absoluteURL } from "~/utils/utils";

import { links as rootLinks } from "./_index";

export function links() {
  return [
    ...rootLinks().filter((x) => !x.extra),
    { rel: "stylesheet", href: styles },
    { rel: "canonical", href: absoluteURL("/contact") },
  ];
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Contact Peter",
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
  return <Contact />;
}
