import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { BlogArchive } from "~/components/blogarchive";
import { get } from "~/lib/get-data";
import archive from "~/styles/blogarchive.css";
import type { Group } from "~/types";
import { absoluteURL } from "~/utils/utils";

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

export async function loader({ request }: LoaderFunctionArgs) {
  const { pathname } = new URL(request.url);
  if (pathname.endsWith("/")) {
    return redirect(pathname.slice(0, -1));
  }
  const fetchURL = "/api/v1/plog/";
  const response = await get<ServerData>(fetchURL);
  if (response.status >= 500) {
    throw new Error(`${response.status} from ${fetchURL}`);
  }
  const { groups } = response.data;
  return json({ groups });
}

export const meta: MetaFunction<typeof loader> = ({ location }) => {
  return [
    {
      title: "Blog archive - Peterbe.com",
    },
    {
      tagName: "link",
      rel: "canonical",
      href: absoluteURL(location.pathname),
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
