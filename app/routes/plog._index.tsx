import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import * as v from "valibot";

import { BlogArchive } from "~/components/blogarchive";
import { get } from "~/lib/get-data";
import archive from "~/styles/blogarchive.css";
import { absoluteURL } from "~/utils/utils";
import { IndexServerData } from "~/valibot-types";

import { links as rootLinks } from "./_index";

export function links() {
  return [
    ...rootLinks().filter((x) => !x.extra),
    { rel: "stylesheet", href: archive },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { pathname } = new URL(request.url);
  if (pathname.endsWith("/")) {
    return redirect(pathname.slice(0, -1));
  }
  const fetchURL = "/api/v1/plog/";
  const response = await get(fetchURL);
  if (response.status >= 500) {
    throw new Error(`${response.status} from ${fetchURL}`);
  }
  try {
    const { groups } = v.parse(IndexServerData, response.data);
    return json({ groups });
  } catch (error) {
    if (v.isValiError(error)) {
      const issue = error.issues[0];
      if (issue.path)
        console.error(
          `Validation issue in ${issue.path.map((p) => p.key).join(".")}`,
        );
    }
    throw error;
  }
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
