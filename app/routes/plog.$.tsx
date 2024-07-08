import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import * as v from "valibot";

import { Blogpost } from "~/components/blogpost";
import { get } from "~/lib/get-data";
import blogpost from "~/styles/blogpost.css";
import { absoluteURL, handleValiError } from "~/utils/utils";
import { ServerData } from "~/valibot-types";

import { links as rootLinks } from "./_index";
export { ErrorBoundary } from "./_index";

export function links() {
  return [
    ...rootLinks().filter((x) => !x.extra || x.extra === "post"),
    { rel: "stylesheet", href: blogpost },
  ];
}

export async function loader({ params }: LoaderFunctionArgs) {
  // invariant(params.oid, `params.oid is required`);
  const dynamicPage = params["*"];
  if (!dynamicPage) {
    // Not sure how this can ever happen
    throw new Response("Invalid splat", { status: 404 });
  }

  if (dynamicPage.endsWith("/")) {
    return redirect(`/plog/${encodeURIComponent(dynamicPage.slice(0, -1))}`);
  }

  if (dynamicPage.endsWith("/p1")) {
    return redirect(
      `/plog/${encodeURIComponent(dynamicPage.replace(/\/p1$/, ""))}`,
    );
  }

  let page = 1;
  let oid = "";
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
    } else {
      if (oid) {
        throw new Response("Not Found (more than one oid)", { status: 404 });
      }
      oid = part;
    }
  }

  if (!oid) {
    throw new Response("Not Found (oid empty)", { status: 404 });
  }

  const sp = new URLSearchParams({ page: `${page}` });
  const fetchURL = `/api/v1/plog/${encodeURIComponent(oid)}?${sp}`;

  const response = await get(fetchURL);
  if (response.status === 404) {
    throw new Response("Not Found (oid not found)", { status: 404 });
  }
  if (response.status >= 500) {
    throw new Error(`${response.status} from ${fetchURL}`);
  }
  try {
    const { post, comments } = v.parse(ServerData, response.data);

    const cacheSeconds =
      post.pub_date && isNotPublished(post.pub_date) ? 0 : 60 * 60 * 12;

    return json(
      { post, comments, page },
      { headers: cacheHeaders(cacheSeconds) },
    );
  } catch (error) {
    handleValiError(error);
    throw error;
  }
}

function isNotPublished(date: string) {
  const actualDate = new Date(date);
  return actualDate > new Date();
}

function cacheHeaders(seconds: number) {
  return { "cache-control": `public, max-age=${seconds}` };
}

export const meta: MetaFunction<typeof loader> = ({
  data,
  params,
  location,
}) => {
  const oid = params["*"]?.split("/")[0];
  if (!oid) throw new Error("No oid");

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
    {
      tagName: "link",
      rel: "canonical",
      href: absoluteURL(location.pathname),
    },
  ];
  return tags.filter((o) => Object.values(o).every((x) => x !== undefined));
};

export default function View() {
  const { post, comments, page } = useLoaderData<typeof loader>();
  return <Blogpost post={post} comments={comments} page={page} />;
}

export function headers({ loaderHeaders }: { loaderHeaders: Headers }) {
  return { "cache-control": loaderHeaders.get("cache-control") || `max-age=0` };
}
