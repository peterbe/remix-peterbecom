import { Link } from "@remix-run/react";
import { Fragment } from "react";

import type { HomepagePost } from "~/types";

type Props = {
  posts: HomepagePost[];
  categories: string[];
  nextPage: number | null;
  previousPage: number | null;
  page: number;
};

export function Homepage({
  posts,
  categories,
  page,
  nextPage,
  previousPage,
}: Props) {
  console.log({ previousPage, nextPage });

  return (
    <div>
      <hgroup>
        <h1>
          <Link to="/">Peterbe.com</Link>
        </h1>
        <h2>Peter Bengtsson's Blog</h2>
      </hgroup>

      <AboutFilters categories={categories} page={page} />

      {posts.map((post) => (
        <Post key={post.oid} post={post} />
      ))}

      <Pagination
        categories={categories}
        nextPage={nextPage}
        previousPage={previousPage}
      />
    </div>
  );
}

function AboutFilters({
  page,
  categories,
}: {
  page: number;
  categories: string[];
}) {
  console.log({ page });

  if (!categories.length && page === 1) return null;

  if (categories.length || page > 0) {
    return (
      <article className="about-filters">
        <div className="grid">
          {categories.length > 0 && (
            <div>
              <p>
                Filtered by{" "}
                {categories.map((name, i, arr) => (
                  <Fragment key={name}>
                    <b>{name}</b>
                    {i < arr.length - 1 ? ", " : ""}
                  </Fragment>
                ))}{" "}
              </p>
            </div>
          )}
          <div>
            <p>{page > 1 && <span>Page {page}</span>}</p>
          </div>
          <div>
            <Link to="/">Reset</Link>
          </div>
        </div>
      </article>
    );
  }
  return null;
  if (page === 1) return null;

  return (
    <p>
      <b>Page {page}</b>
    </p>
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

function categoryURL(name: string) {
  return `/oc-${name.replace(" ", "+")}`;
}

function makeURL(page: number, categories: string[]) {
  let url = "";
  for (const category of categories) {
    url += `/oc-${category.replace(/\s/g, "+")}`;
  }
  if (page && page !== 1) {
    url += `/p${page}`;
  }
  return url || "/";
}

function Pagination({
  categories,
  nextPage,
  previousPage,
}: {
  categories: string[];
  nextPage: number | null;
  previousPage: number | null;
}) {
  return (
    <div className="grid next-previous">
      <div>
        {previousPage ? (
          <Link to={makeURL(previousPage, categories)}>Previous page</Link>
        ) : (
          <i>Previous page</i>
        )}
      </div>
      <div>
        {nextPage ? (
          <Link to={makeURL(nextPage, categories)}>Next page</Link>
        ) : (
          <i>Next page</i>
        )}
      </div>
    </div>
  );
}
