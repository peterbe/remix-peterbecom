import type { V2_MetaFunction } from "@remix-run/node";

import { Search } from "~/components/search";
import search from "~/styles/search.css";

import { links as rootLinks } from "./_index";

export function links() {
  return [
    ...rootLinks().filter((x) => !x.extra),
    { rel: "stylesheet", href: search },
  ];
}

export const meta: V2_MetaFunction = ({ params }) => {
  return [
    {
      title: "Searching on Peterbe.com",
    },
  ];
};

export default function View() {
  return <Search />;
}
