import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import * as v from "valibot";

import { Lyricspost } from "~/components/lyricspost";
import { get } from "~/lib/get-data";
import lyricspost from "~/styles/lyricspost.css";
import { absoluteURL, handleValiError } from "~/utils/utils";
import { ServerData } from "~/valibot-types";

import { links as rootLinks } from "./_index";
export { ErrorBoundary } from "./_index";

export function links() {
  return [
    ...rootLinks().filter((x) => !x.extra),
    { rel: "stylesheet", href: lyricspost },
  ];
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { pathname } = new URL(request.url);
  if (pathname.endsWith("/")) {
    return redirect(pathname.slice(0, -1));
  }
  if (pathname.endsWith("/p1")) {
    return redirect(pathname.slice(0, -3));
  }

  const dynamicPage = params["*"] || "";

  let page = 1;
  let oid = "blogitem-040601-1";
  for (const part of dynamicPage.split("/")) {
    if (!part) {
      // Because in JS,
      // > "".split('/')
      // [ '' ]
      continue;
    }
    if (/^p\d+$/.test(part)) {
      page = parseInt(part.replace("p", ""));
      if (isNaN(page)) {
        throw new Response("Not Found (page not valid)", { status: 404 });
      }
      continue;
    }
  }

  const sp = new URLSearchParams({ page: `${page}` });
  const fetchURL = `/api/v1/plog/${encodeURIComponent(oid)}?${sp}`;

  const response = await get(fetchURL);
  if (response.status === 404) {
    throw new Response("Not Found (oid not found)", { status: 404 });
  }
  if (response.status != 200) {
    console.warn(`UNEXPECTED STATUS (${response.status}) from ${fetchURL}`);
    throw new Error(`${response.status} from ${fetchURL}`);
  }
  try {
    const { post, comments } = v.parse(ServerData, response.data);

    const cacheSeconds = 60 * 60 * 12;

    return json(
      { post, comments, page },
      { headers: cacheHeaders(cacheSeconds) },
    );
  } catch (error) {
    handleValiError(error);
    throw error;
  }
}

function cacheHeaders(seconds: number) {
  return { "cache-control": `public, max-age=${seconds}` };
}

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
  const pageTitle = "Find song by lyrics";
  const page = data?.page || 1;

  // The contents of the `<title>` has to be a string
  const title = `${pageTitle} ${
    page > 1 ? ` (Page ${page})` : " Looking for songs by the lyrics"
  }`;
  return [
    { title: title },
    {
      tagName: "link",
      rel: "canonical",
      href: absoluteURL(location.pathname),
    },
    {
      name: "description",
      content: "Find songs by lyrics.",
    },
    {
      property: "og:description",
      content:
        "You can find the song if you only know parts of the song's lyrics.",
    },
  ];
};

export default function View() {
  const { post, comments, page } = useLoaderData<typeof loader>();
  return <Lyricspost post={post} comments={comments} page={page} />;
}

export function headers({ loaderHeaders }: { loaderHeaders: Headers }) {
  return { "cache-control": loaderHeaders.get("cache-control") || `max-age=0` };
}
