import { Link } from "@remix-run/react";
import { Fragment } from "react";

import type { HomepagePost } from "~/types";

type Props = {
  posts: HomepagePost[];
  categories: string[];
  nextPage: number;
  previousPage: number;
};

export function Homepage({ posts, categories, nextPage, previousPage }: Props) {
  return (
    <div>
      <hgroup>
        <h1>
          <Link to="/">Peterbe.com</Link>
        </h1>
        <h2>Peter Bengtsson's Blog</h2>
      </hgroup>

      {posts.map((post) => (
        <Post key={post.oid} post={post} />
      ))}

      <Link to="/plog">Blog Posts</Link>
    </div>
  );
}

function Post({ post }: { post: HomepagePost }) {
  console.log(post);
  console.log(post.categories);
  const pubDate = new Date(post.pub_date);

  return (
    <article>
      <header>
        <hgroup>
          <h2>
            <Link to={`/plog/${post.oid}`}>{post.title}</Link>
          </h2>
          <h3>
            <b>
              {pubDate.toLocaleDateString("en-us", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </b>{" "}
            <span>
              {`${post.comments} comment${post.comments === 1 ? "" : "s"}`}
            </span>{" "}
            <span>
              {post.categories.map((category, i, arr) => {
                return (
                  <Fragment key={category}>
                    <Link to={`/oc-${encodeURIComponent(category)}`}>
                      {category}
                    </Link>
                    {i < arr.length - 1 ? ", " : ""}
                  </Fragment>
                );
              })}
            </span>
          </h3>
        </hgroup>
      </header>

      <div dangerouslySetInnerHTML={{ __html: post.html }} />
      <footer>
        <p>
          <Link to={`/plog/${post.oid}#commentform`}>
            Please post a comment if you have thoughts or questions
          </Link>
        </p>
      </footer>
    </article>
  );
}
