import pico from "@picocss/pico/css/pico.css";
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useRouteError } from "@remix-run/react";

import { Homepage } from "~/components/homepage";
// import { get } from "~/lib/get-data";
import { get } from "~/lib/get-data";
import styles from "~/styles/globals.css";
import highlight from "~/styles/highlight.css";
import homepage from "~/styles/homepage.css";
import post from "~/styles/post.css";
import type { HomepagePost } from "~/types";

export function links() {
  return [
    { rel: "stylesheet", href: pico },
    { rel: "stylesheet", href: styles },
    // These are extra and generally won't be needed on most overriding
    // pages such as `about.tsx`.
    { rel: "stylesheet", href: homepage, extra: "homepage" },
    { rel: "stylesheet", href: post, extra: "post" },
    { rel: "stylesheet", href: highlight, extra: "post" },
  ];
}

interface ServerData {
  posts: HomepagePost[];
  next_page: number | null;
  previous_page: number | null;
}

export const loader = async ({ params }: LoaderArgs) => {
  const dynamicPage = params["*"] || "";
  // if (!dynamicPage) {
  //   // Not sure how this can ever happen
  //   throw new Response("Invalid splat", { status: 404 });
  // }

  let page = 1;
  const categories: string[] = [];

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
    } else if (/oc-[\w+]+/.test(part)) {
      const matched = part.match(/oc-([\w+]+)/);
      if (matched) {
        const category = matched[1].replace(/\+/g, " ");
        categories.push(category);
        continue;
      }
    }
    throw new Response(`Invalid splat part (${part})`, { status: 404 });
  }
  const sp = new URLSearchParams({ page: `${page}` });
  categories.forEach((category) => sp.append("oc", category));
  const url = `/api/v1/plog/homepage?${sp}`;
  const response = await get<ServerData>(url, { followRedirect: false });
  if (response.statusCode === 404 || response.statusCode === 400) {
    throw new Response("Not Found", { status: 404 });
  }

  if (response.statusCode === 301 && response.headers.location) {
    return redirect(response.headers.location, 308);
  }
  const {
    posts,
    next_page: nextPage,
    previous_page: previousPage,
  } = response.body;
  return json({ categories, posts, nextPage, previousPage, page });
};

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Peterbe.com - Stuff in Peter's head",
    },
  ];
};

export function headers() {
  const seconds = 60 * 60;
  return {
    "cache-control": `public, max-age=${seconds}`,
  };
}

export default function View() {
  const { page, posts, categories, nextPage, previousPage } =
    useLoaderData<typeof loader>();
  return (
    <Homepage
      posts={posts}
      categories={categories}
      nextPage={nextPage}
      previousPage={previousPage}
      page={page}
    />
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  console.log(
    "Error in routes/_index.tsx",
    typeof error,
    error instanceof Error,
    error
  );

  let errorMessage = "Unknown error";
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div>
      <h1>Application error</h1>
      <p>Something went wrong.</p>
      <pre>{errorMessage}</pre>
    </div>
  );
}
