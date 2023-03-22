import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import { get } from "../../lib/get-data";
import type { Group } from "~/types";
import { BlogArchive } from "~/components/blogarchive";

interface ServerData {
  groups: Group[];
}

export const loader = async () => {
  const response = await get<ServerData>("/api/v1/plog/", true);
  const { groups } = response.body;
  return json({ groups });
};

export function meta() {
  return {
    title: "Blog archive - Peterbe.com",
  };
}

export default function View() {
  const { groups } = useLoaderData<typeof loader>();
  return <BlogArchive groups={groups} />;
}
