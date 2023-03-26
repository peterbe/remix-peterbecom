import type { V2_MetaFunction } from "@remix-run/node";

import { Contact } from "~/components/contact";
import styles from "~/styles/contact.css";

import { links as rootLinks } from "./_index";

export function links() {
  return [
    ...rootLinks().filter((x) => !x.extra),
    { rel: "stylesheet", href: styles },
  ];
}

export const meta: V2_MetaFunction = () => {
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
