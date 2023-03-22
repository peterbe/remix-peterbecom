import { Link } from "@remix-run/react";

import type { Comments, Post } from "~/types";

type Props = {
  post: Post;
  comments: Comments;
  page: number;
};
export function Blogpost({ post, comments, page }: Props) {
  return (
    <main>
      <hgroup>
        <h1>{post.title}</h1>
        <h2>
          Back to <Link to="/">Peterbe.com</Link>
        </h2>
      </hgroup>

      <div dangerouslySetInnerHTML={{ __html: post.body }} />

      <Link to="/">Home</Link>
      <Link to="/plog">Archive</Link>
    </main>
  );
}
