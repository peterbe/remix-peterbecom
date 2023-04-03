import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Lyricspost } from "~/components/lyricspost";
import { get } from "~/lib/get-data";
import lyricspost from "~/styles/lyricspost.css";
import type { Comments, Post } from "~/types";

import { links as rootLinks } from "./_index";
export { ErrorBoundary } from "./plog.$";

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

export const loader = async ({ params, request }: LoaderArgs) => {
  // invariant(params.oid, `params.oid is required`);
  // console.log("IN plog.$oid.tsx PARAMS:", params);
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

  const response = await get<ServerData>(fetchURL);
  if (response.statusCode === 404) {
    throw new Response("Not Found (oid not found)", { status: 404 });
  }
  const { post, comments } = response.body;

  const cacheSeconds = 60 * 60 * 12;
  return json(
    { post, comments, page },
    { headers: cacheHeaders(cacheSeconds) }
  );
};

function cacheHeaders(seconds: number) {
  return { "cache-control": `public, max-age=${seconds}` };
}

export const meta: V2_MetaFunction = ({ data, params }) => {
  //   // invariant(params.oid, `params.oid is required`);
  //   // console.log("PARAMS (meta)", params);
  //   const oid = params["*"]?.split("/")[0];
  //   if (!oid) throw new Error("No oid");

  //   // const { oid } = params;

  //   if (!data) {
  //     // In catch CatchBoundary
  //     return [{ title: "Page not found" }];
  //   }

  //   let pageTitle = "";

  //   pageTitle = data.post.title;

  //   if (data.page > 1) {
  //     pageTitle += ` (page ${data.page})`;
  //   }
  //   pageTitle += " - Peterbe.com";

  //   const summary = data.post.summary || undefined;
  //   const openGraphImage = data.post.open_graph_image
  //     ? absoluteURL(data.post.open_graph_image)
  //     : undefined;

  let pageTitle = "Find song by lyrics";

  let page = 1;

  // The contents of the `<title>` has to be a string
  const title = `${pageTitle} ${
    page > 1 ? ` (Page ${page})` : " Looking for songs by the lyrics"
  }`;
  const tags = [
    { title: title },
    // {
    //   property: "og:url",
    //   content: `https://www.peterbe.com/plog/${oid}`,
    // },
    // {
    //   property: "og:type",
    //   content: "article",
    // },
    // {
    //   property: "og:title",
    //   content: pageTitle,
    // },
    // { property: "og:description", content: summary },

    // // Twitter uses 'name', OpenGraph uses 'property'
    // { name: "twitter:creator", content: "@peterbe" },
    // { name: "twitter:card", content: "summary_large_image" },
    // { name: "twitter:title", content: pageTitle },
    // { name: "twitter:description", content: summary },

    // { name: "description", content: summary },
    // { name: "twitter:image", content: openGraphImage },
    // { property: "og:image", content: openGraphImage },
  ];
  return tags.filter((o) => Object.values(o).every((x) => x !== undefined));
};

export default function View() {
  const { post, comments, page } = useLoaderData<typeof loader>();
  return <Lyricspost post={post} comments={comments} page={page} />;
}

export function headers({ loaderHeaders }: { loaderHeaders: Headers }) {
  return { "cache-control": loaderHeaders.get("cache-control") || `max-age=0` };
}
