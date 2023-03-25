import type { V2_MetaFunction } from "@remix-run/node";

import { About } from "~/components/about";
import styles from "~/styles/about.css";

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
      title: "About Peterbe.com",
    },
  ];
};

export default function View() {
  return <About />;
}
