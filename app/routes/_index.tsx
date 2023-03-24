import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Homepage } from "~/components/homepage";
import { get } from "~/lib/get-data";
import type { HomepagePost } from "~/types";

interface ServerData {
  posts: HomepagePost[];
  next_page: number | null;
  previous_page: number | null;
}

export const loader = async ({ params }: LoaderArgs) => {
  const categories: string[] = [];
  const response = await get<ServerData>("/api/v1/plog/homepage");
  const page = 1;
  const {
    posts,
    next_page: nextPage,
    previous_page: previousPage,
  } = response.body;
  return json({ categories, posts, nextPage, previousPage, page });
};

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  return {
    title: "Peterbe.com - Stuff in Peter's head",
  };
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
