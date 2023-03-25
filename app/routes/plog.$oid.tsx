import type { MetaFunction } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
  const { oid } = params;
  // console.log({ oid });
  // const oid = params!.oid as string;
  const fetchURL = `/api/v1/plog/${encodeURIComponent(oid)}`;

  const response = await get<ServerData>(fetchURL);
  const page = 1;
  const { post, comments } = response.body;
  return json({ post, comments, page });
};

// export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
export const meta: V2_MetaFunction = ({ data, params }) => {
  // if (!data) {
  //   return {
  //     title: "Missing Shake",
  //     description: `There is no shake with the ID of ${params.shakeId}. 😢`,
  //   };
  // }
  invariant(params.oid, `params.oid is required`);
  const { oid } = params;

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
  // return {
  //   title: pageTitle,
  //   "og:url": `https://www.peterbe.com/plog/${oid}`,
  //   "og:type": "article",
  //   "og:title": pageTitle,
  //   "og:description": summary,
  //   "twitter:creator": "@peterbe",
  //   "twitter:card": "summary_large_image",
  //   "twitter:title": pageTitle,
  //   description: summary,
  //   "twitter:description": summary,
  //   "twitter:image": openGraphImage,
  //   "og:image": openGraphImage,
  // };
  const tags = [
    { title: pageTitle },
    {
      name: "og:url",
      content: `https://www.peterbe.com/plog/${oid}`,
    },
    // "og:type": "article",
    // "og:title": pageTitle,
    // "og:description": summary,
    // "twitter:creator": "@peterbe",
    // "twitter:card": "summary_large_image",
    // "twitter:title": pageTitle,
    // description: summary,
    // "twitter:description": summary,
    // "twitter:image": openGraphImage,
    // "og:image": openGraphImage,
  ];
  return tags;
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
