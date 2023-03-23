import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useCatch } from "@remix-run/react";

import { Homepage } from "~/components/homepage";
import type { HomepagePost } from "~/types";

import { get } from "~/lib/get-data";

interface ServerData {
  posts: HomepagePost[];
  next_page: number | null;
  previous_page: number | null;
}

export const loader = async ({ params }: LoaderArgs) => {
  const dynamicPage = params["*"];
  if (!dynamicPage) {
    // Not sure how this can ever happen
    throw new Response("Invalid splat", { status: 404 });
  }

  let page = 1;
  const categories: string[] = [];

  for (const part of dynamicPage.split("/")) {
    if (/^p\d+$/.test(part)) {
      page = parseInt(part.replace("p", ""));
      if (isNaN(page)) {
        throw new Response("Not Found (page not valid)", { status: 404 });
      }
      continue;
    } else if (/oc-[\w\+]+/.test(part)) {
      const matched = part.match(/oc-([\w\+]+)/);
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
  const response = await get<ServerData>(`/api/v1/plog/homepage?${sp}`);
  if (response.statusCode === 404) {
    throw new Response("Not Found", { status: 404 });
  }
  // XXX What if you get a 301 or 302??

  const {
    posts,
    next_page: nextPage,
    previous_page: previousPage,
  } = response.body;
  console.log("RETURNING", { page });

  return json({ categories, posts, nextPage, previousPage, page });
};

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  let title = "Peterbe.com - Stuff in Peter's head";
  if (data) {
    const { page, categories } = data;
    if (categories && categories.length > 0) {
      title = `${categories.join(", ")} - Peterbe.com`;
    }
    if (page !== 1) {
      title = `(Page ${page}) ${title}`;
    }
  }
  return {
    title,
  };
};

export default function View() {
  const { page, posts, categories, nextPage, previousPage } =
    useLoaderData<typeof loader>();
  console.log("VIEW", { page });

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
