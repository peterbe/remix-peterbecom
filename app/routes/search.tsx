import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  type ClientLoaderFunctionArgs,
  json,
  useLoaderData,
} from "@remix-run/react";

import { Search } from "~/components/search";
import type { ServerData } from "~/search-types";
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

type LoaderData = {
  q: string | null;
  debug: boolean;
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

export const clientLoader = async ({
  serverLoader,
}: ClientLoaderFunctionArgs) => {
  const data = await serverLoader<LoaderData>();

  const { q, debug } = data;

  const apiURL =
    q && q.trim()
      ? `/api/v1/search?${new URLSearchParams({
          q: q.trim(),
          debug: JSON.stringify(debug),
        }).toString()}`
      : null;
  let searchResults: ServerData | null = null;
  let searchError: Error | null = null;
  if (apiURL) {
    try {
      const response = await fetch(apiURL);
      if (response.ok) {
        searchResults = (await response.json()) as ServerData;
      } else {
        searchError = new Error(`Error ${response.status} on ${apiURL}`);
      }
    } catch (exception) {
      if (exception instanceof Error) {
        searchError = exception;
      } else {
        throw exception;
      }
    }
  }

  return { q, debug, searchResults, searchError };
};
clientLoader.hydrate = true;

export function headers() {
  const seconds = 60 * 60;
  return {
    "cache-control": `public, max-age=${seconds}`,
  };
}

export default function View() {
  const data = useLoaderData<typeof clientLoader>();
  return <Search {...data} />;
}
