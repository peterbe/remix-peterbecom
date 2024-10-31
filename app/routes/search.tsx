import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

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

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const q = data?.q || null;

  return [
    {
      title: q ? `Searching for "${q}"` : "Searching on Peterbe.com",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { search } = new URL(request.url);
  const sp = new URLSearchParams(search);
  const q = sp.get("q");
  const debug = sp.get("debug") === "true" || sp.get("debug") === "1";

  return json({
    q,
    debug,
  });
}

export function headers() {
  const seconds = 60 * 60;
  return {
    "cache-control": `public, max-age=${seconds}`,
  };
}

export default function View() {
  const data = useLoaderData<typeof loader>();

  return <Search {...data} />;
}
