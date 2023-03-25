import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useCatch } from "@remix-run/react";
import { redirect } from "@remix-run/node";

import { Homepage } from "~/components/homepage";
import { get } from "~/lib/get-data";
import type { HomepagePost } from "~/types";

import { links as rootLinks } from "./_index";

export function links() {
  return [...rootLinks()];
}

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
  const response = await get<ServerData>(
    `/api/v1/plog/homepage?${sp}`,
    false,
    false
  );
  if (response.statusCode === 404 || response.statusCode === 400) {
    throw new Response("Not Found", { status: response.statusCode });
  }

  if (response.statusCode === 301 && response.headers.location) {
    return redirect(response.headers.location);
  }

  const {
    posts,
    next_page: nextPage,
    previous_page: previousPage,
  } = response.body;

  return json({ categories, posts, nextPage, previousPage, page });
};

export const meta: V2_MetaFunction = ({ data, params }) => {
  let title = "Peterbe.com - Stuff in Peter's head";
  if (!data) {
    return [{ title: "Page not found" }];
  }
  const { page, categories } = data;
  if (categories && categories.length > 0) {
    title = `${categories.join(", ")} - Peterbe.com`;
  }
  if (page !== 1) {
    title = `(Page ${page}) ${title}`;
  }
  return [
    {
      title,
    },
  ];
};

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
