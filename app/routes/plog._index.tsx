import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
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

export const loader = async ({ request }: LoaderArgs) => {
  const { pathname } = new URL(request.url);
  if (pathname.endsWith("/")) {
    return redirect(pathname.slice(0, -1));
  }
  const response = await get<ServerData>("/api/v1/plog/");
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

export function headers() {
  const seconds = 60 * 60 * 12;
  return {
    "cache-control": `public, max-age=${seconds}`,
  };
}

export default function View() {
  const { groups } = useLoaderData<typeof loader>();
  return <BlogArchive groups={groups} />;
}
