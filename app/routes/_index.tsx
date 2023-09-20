import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useLocation,
  useRouteError,
} from "@remix-run/react";
import Rollbar from "rollbar";

import { Homepage } from "~/components/homepage";
import { get } from "~/lib/get-data";
import global from "~/styles/build/global.css";
import post from "~/styles/build/post.css";
import homepage from "~/styles/homepage.css";
import type { HomepagePost } from "~/types";
import { absoluteURL } from "~/utils/utils";

export function links() {
  return [
    { rel: "stylesheet", href: global },

    // These are extra and generally won't be needed on most overriding
    // pages such as `about.tsx`.
    { rel: "stylesheet", href: homepage, extra: "homepage" },
    { rel: "stylesheet", href: post, extra: "post" },
  ];
}

interface ServerData {
  posts: HomepagePost[];
  next_page: number | null;
  previous_page: number | null;
}

export async function loader({ params }: LoaderFunctionArgs) {
  const dynamicPage = params["*"] || "";

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

  if (response.status === 404 || response.status === 400) {
    throw new Response("Not Found", { status: 404 });
  }
  if (response.status === 301 && response.headers.location) {
    return redirect(response.headers.location, 308);
  }
  if (response.status >= 500) {
    throw new Error(`${response.status} from ${url}`);
  }
  const {
    posts,
    next_page: nextPage,
    previous_page: previousPage,
  } = response.data;
  return json({ categories, posts, nextPage, previousPage, page });
}

export const meta: MetaFunction<typeof loader> = ({ location }) => {
  return [
    {
      title: "Peterbe.com - Stuff in Peter's head",
    },
    {
      tagName: "link",
      rel: "canonical",
      href: absoluteURL(location.pathname),
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

// This runs both on the server and the client.
// It happens if an error is thrown in a loader function or
// if you get a routing error such as a 404.
export function ErrorBoundary() {
  console.log("ERROR BOUNDARY IN routes/_index.tsx");

  const error = useRouteError();
  const location = useLocation();

  if (isRouteErrorResponse(error)) {
    if (error.status >= 400 && error.status < 500) {
      return (
        <div>
          <h1>Page not found</h1>
          <p>Uhhh... I have no idea.</p>
          <pre>{error.status}</pre>
        </div>
      );
    }
  }
  console.log(
    "Error in routes/_index.tsx",
    typeof error,
    error instanceof Error,
    error,
  );

  if (typeof process === "object" && process.env.ROLLBAR_ACCESS_TOKEN) {
    const rollbar = new Rollbar({
      accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    });

    rollbar.error(error instanceof Error ? error : new Error("Unknown error"), {
      context: {
        pathname: location.pathname,
        search: location.search,
      },
    });
  }

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
