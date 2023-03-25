import { Link } from "@remix-run/react";
import { Fragment } from "react";

import type { Comments, Post } from "~/types";
import { categoryURL } from "~/utils/utils";

import { Nav } from "./nav";

type Props = {
  post: Post;
  comments: Comments;
  page: number;
};
export function Blogpost({ post, comments, page }: Props) {
  const pubDate = new Date(post.pub_date);
  return (
    <div>
      <Nav
        title={post.title}
        subHead={
          <>
            <b>
              {pubDate.toLocaleDateString("en-us", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </b>
            <br />
            <span>
              {`${comments.count} comment${comments.count === 1 ? "" : "s"}`}
            </span>{" "}
            <span>
              {post.categories.map((category, i, arr) => {
                return (
                  <Fragment key={category}>
                    <Link
                      to={categoryURL(category)}
                      rel="nofollow"
                      title={`Filter by the '${category}' category'`}
                    >
                      {category}
                    </Link>
                    {i < arr.length - 1 ? ", " : ""}
                  </Fragment>
                );
              })}
            </span>
          </>
        }
      />

      {post.url && <AboutPostURL url={post.url} />}

      <div dangerouslySetInnerHTML={{ __html: post.body }} />
    </div>
  );
}

function AboutPostURL({ url }: { url: string }) {
  return (
    <p className="post-url">
      <b>URL:</b>{" "}
      <a href={url} rel="nofollow">
        {url}
      </a>
    </p>
  );
}
