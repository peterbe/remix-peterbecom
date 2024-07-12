import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Lyricspost } from "~/components/lyricspost";
import { get } from "~/lib/get-data";
import lyricspost from "~/styles/lyricspost.css";
import type { Comments, Post } from "~/types";
import { absoluteURL } from "~/utils/utils";

import { links as rootLinks } from "./_index";
export { ErrorBoundary } from "./_index";

export function links() {
  return [
    ...rootLinks().filter((x) => !x.extra),
    { rel: "stylesheet", href: lyricspost },
  ];
}

interface ServerData {
  post: Post;
  comments: Comments;
}

type LyricsResult = {
  id: number;
};
type LyricsResults = LyricsResult[];
interface ServerSearchData {
  results: LyricsResults;
  metadata: {
    limit: number;
    desperate: boolean;
    total: number;
    search: string;
  };
  // comments: Comments;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  // invariant(params.oid, `params.oid is required`);

  console.log("IN plog.$blogitem-040601.$.tsx PARAMS:", params);
  const { pathname } = new URL(request.url);
  if (pathname.endsWith("/")) {
    return redirect(pathname.slice(0, -1));
  }
  if (pathname.endsWith("/p1")) {
    return redirect(pathname.slice(0, -3));
  }

  const dynamicPage = params["*"] || "";

  let isSearch = false;
  let page = 1;
  let oid = "blogitem-040601-1";
  const parts = dynamicPage.split("/");
  console.log({ parts });
  let search = "";

  for (const part of parts) {
    if (!part) {
      // Because in JS,
      // > "".split('/')
      // [ '' ]
      continue;
    }
    if (part === "search") {
      isSearch = true;
      continue;
    }
    if (/^p\d+$/.test(part)) {
      page = parseInt(part.replace("p", ""));
      if (isNaN(page)) {
        throw new Response("Not Found (page not valid)", { status: 404 });
      }
      continue;
    }
    search = part;
  }

  const sp = new URLSearchParams({ page: `${page}` });
  if (isSearch) {
    if (!search) {
      return redirect("/plog/blogitem-040601-1", 308);
    }
    sp.append("q", search);
    const fetchURL = `/api/v1/lyrics/search?${sp}`;
    const response = await get<ServerSearchData>(fetchURL);
    if (response.status === 404) {
      throw new Response("Not Found (oid not found)", { status: 404 });
    }
    if (response.status != 200) {
      console.warn(`UNEXPECTED STATUS (${response.status}) from ${fetchURL}`);
      throw new Error(`${response.status} from ${fetchURL}`);
    }
    const { results, metadata } = response.data;

    const cacheSeconds = 60 * 60 * 12;

    return json(
      { results, metadata, page },
      { headers: cacheHeaders(cacheSeconds) }
    );
  }

  const fetchURL = `/api/v1/plog/${encodeURIComponent(oid)}?${sp}`;

  const response = await get<ServerData>(fetchURL);
  if (response.status === 404) {
    throw new Response("Not Found (oid not found)", { status: 404 });
  }
  if (response.status != 200) {
    console.warn(`UNEXPECTED STATUS (${response.status}) from ${fetchURL}`);
    throw new Error(`${response.status} from ${fetchURL}`);
  }
  const { post, comments } = response.data;

  const cacheSeconds = 60 * 60 * 12;

  return json(
    { post, comments, page },
    { headers: cacheHeaders(cacheSeconds) }
  );
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
  const loaderData = useLoaderData<typeof loader>();
  if ("post" in loaderData && "comments" in loaderData) {
    const { post, comments, page } = loaderData;
    return <Lyricspost post={post} comments={comments} page={page} />;
  } else if ("results" in loaderData && "metadata" in loaderData) {
    const { results, metadata } = loaderData;
    return <LyricsSearch results={results} metadata={metadata} />;
  } else {
    throw new Error("Unexpected loader data");
  }
}

export function headers({ loaderHeaders }: { loaderHeaders: Headers }) {
  return { "cache-control": loaderHeaders.get("cache-control") || `max-age=0` };
}
