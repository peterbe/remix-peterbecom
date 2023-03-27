import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { Blogpost } from "~/components/blogpost";
import { get } from "~/lib/get-data";
import blogpost from "~/styles/blogpost.css";
import type { Comments, Post } from "~/types";

import { links as rootLinks } from "./_index";

export function links() {
  return [
    ...rootLinks().filter((x) => !x.extra || x.extra === "post"),
    { rel: "stylesheet", href: blogpost },
  ];
}

interface ServerData {
  post: Post;
  comments: Comments;
}

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.oid, `params.oid is required`);
  console.log("IN plog.$oid.tsx PARAMS:", params);

  let page = 1;
  const dynamicPage = params["*"] || "";

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
    throw new Response(`Invalid splat part (${part})`, { status: 404 });
  }

  const { oid } = params;
  const sp = new URLSearchParams({ page: `${page}` });
  const fetchURL = `/api/v1/plog/${encodeURIComponent(oid)}?${sp}`;

  const response = await get<ServerData>(fetchURL);
  if (response.statusCode === 404) {
    throw new Response("Not Found (oid not found)", { status: 404 });
  }
  const { post, comments } = response.body;

  const cacheSeconds =
    post.pub_date && isNotPublished(post.pub_date) ? 0 : 60 * 60 * 12;
  return json(
    { post, comments, page },
    { headers: cacheHeaders(cacheSeconds) }
  );
};

function isNotPublished(date: string) {
  const actualDate = new Date(date);
  return actualDate > new Date();
}

function cacheHeaders(seconds: number) {
  return { "cache-control": `public, max-age=${seconds}` };
}

export const meta: V2_MetaFunction = ({ data, params }) => {
  invariant(params.oid, `params.oid is required`);
  const { oid } = params;

  if (!data) {
    // In catch CatchBoundary
    return [{ title: "Page not found" }];
  }

  let pageTitle = "";

  pageTitle = data.post.title;

  if (data.page > 1) {
    pageTitle += ` (page ${data.page})`;
  }
  pageTitle += " - Peterbe.com";

  const summary = data.post.summary || undefined;
  const openGraphImage = data.post.open_graph_image
    ? absoluteURL(data.post.open_graph_image)
    : undefined;
  const tags = [
    { title: pageTitle },
    {
      property: "og:url",
      content: `https://www.peterbe.com/plog/${oid}`,
    },
    {
      property: "og:type",
      content: "article",
    },
    {
      property: "og:title",
      content: pageTitle,
    },
    { property: "og:description", content: summary },

    // Twitter uses 'name', OpenGraph uses 'property'
    { name: "twitter:creator", content: "@peterbe" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: summary },

    { name: "description", content: summary },
    { name: "twitter:image", content: openGraphImage },
    { property: "og:image", content: openGraphImage },
  ];
  return tags.filter((o) => Object.values(o).every((x) => x !== undefined));
};

function absoluteURL(uri: string) {
  if (!uri.includes("://")) {
    return `https://www.peterbe.com${uri}`;
  }
  return uri;
}

export default function View() {
  const { post, comments, page } = useLoaderData<typeof loader>();
  return <Blogpost post={post} comments={comments} page={page} />;
}

export function headers({ loaderHeaders }: { loaderHeaders: Headers }) {
  return { "cache-control": loaderHeaders.get("cache-control") || `max-age=0` };
}

export function CatchBoundary() {
  const caught = useCatch();
  const pageNotFound = caught.status === 404;

  return (
    <div>
      <h1>{pageNotFound ? "Page not found" : "Error"}</h1>
      <p>Status: {caught.status}</p>
      <pre>
        <code>{JSON.stringify(caught.data, null, 2)}</code>
      </pre>
    </div>
  );
}
