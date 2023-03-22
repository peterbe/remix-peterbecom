import { Link } from "@remix-run/react";

import type { HomepagePost } from "~/types";

type Props = {
  posts: HomepagePost[];
  categories: string[];
  nextPage: number;
  previousPage: number;
};

export function Homepage({}: Props) {
  return (
    <div>
      <h1>Welcome to Remix</h1>

      <button>Button</button>
      <input type="submit"></input>

      <Link to="/plog">Blog Posts</Link>
    </div>
  );
}
