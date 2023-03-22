import { Fragment } from "react";
import { Link } from "@remix-run/react";

import type { Group } from "~/types";

type Props = {
  groups: Group[];
};

export function BlogArchive({ groups }: Props) {
  return (
    <main>
      <h1>Blog archive</h1>
      <dl>
        {groups.map(({ date, posts }) => {
          return (
            <Fragment key={date}>
              <dt>{formatDate(date)}</dt>
              {posts.map((post) => {
                // Use Intl instead
                const count = `${post.comments.toLocaleString()} comment${
                  post.comments === 1 ? "" : "s"
                }`;
                return (
                  <dd key={post.oid}>
                    <Link to={`/plog/${post.oid}`}>{post.title}</Link>{" "}
                    {post.comments > 0 && <span>{count}</span>}{" "}
                    {/* Using <b> here because of SCSS in Archive.module.scss
                      I can't seen to use something like <span className="categories">
                       */}
                    <b>{post.categories.join(", ")}</b>
                  </dd>
                );
              })}
            </Fragment>
          );
        })}
      </dl>
      <Link to="/">Home</Link>
    </main>
  );
}

function formatDate(date: string) {
  const [year, month] = date.split(".");
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[parseInt(month) - 1];
  return `${monthName}, ${year}`;
}
