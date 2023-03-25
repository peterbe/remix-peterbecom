import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { BlogArchive } from "~/components/blogarchive";
import { get } from "~/lib/get-data";
import archive from "~/styles/blogarchive.css";
import type { Group } from "~/types";

import { links as rootLinks } from "./_index";

export function links() {
  return [
    ...rootLinks().filter((x) => !x.extra),
    { rel: "stylesheet", href: archive },
  ];
}

interface ServerData {
  groups: Group[];
}

export const loader = async () => {
  const response = await get<ServerData>("/api/v1/plog/", true);
  const { groups } = response.body;
  return json({ groups });
};

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Blog archive - Peterbe.com",
    },
  ];
};

export default function View() {
  const { groups } = useLoaderData<typeof loader>();
  return <BlogArchive groups={groups} />;
}
