import { Link } from "@remix-run/react";

import type { Comments, Post } from "~/types";

import { Nav } from "./nav";

type Props = {
  post: Post;
  comments: Comments;
  page: number;
};
export function Blogpost({ post, comments, page }: Props) {
  return (
    <div>
      <Nav title={post.title} />

      {post.url && (
        <p>
          <b>URL:</b>{" "}
          <a href={post.url} rel="nofollow">
            {post.url}
          </a>
        </p>
      )}

      <div dangerouslySetInnerHTML={{ __html: post.body }} />

      <Link to="/">Home</Link>
      <Link to="/plog">Archive</Link>
    </div>
  );
}
