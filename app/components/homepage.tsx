import { Link } from "@remix-run/react";
import { Fragment } from "react";

import type { HomepagePost } from "~/types";

type Props = {
  posts: HomepagePost[];
  categories: string[];
  nextPage: number | null;
  previousPage: number | null;
};

export function Homepage({ posts, categories, nextPage, previousPage }: Props) {
  console.log({ previousPage, nextPage });

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

      <div className="grid next-previous">
        <div>
          {previousPage ? (
            <Link to={`/p${previousPage}`}>Previous page</Link>
          ) : (
            <i>Previous page</i>
          )}
        </div>
        <div>
          {nextPage ? (
            <Link to={`/p${nextPage}`}>Next page</Link>
          ) : (
            <i>Next page</i>
          )}
        </div>
      </div>
    </div>
  );
}

function Post({ post }: { post: HomepagePost }) {
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
            </b>
            <br />
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
