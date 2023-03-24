import { Link } from "@remix-run/react";
import { Fragment } from "react";

import type { Group } from "~/types";

import { Nav } from "./nav";

type Props = {
  groups: Group[];
};

export function BlogArchive({ groups }: Props) {
  return (
    <div>
      <Nav title="Blog archive" />

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
                    {post.categories.map((name, i, arr) => (
                      <Fragment key={name}>
                        <Link to={categoryURL(name)} rel="nofollow">
                          {name}
                        </Link>
                        {i < arr.length - 1 ? ", " : ""}
                      </Fragment>
                    ))}
                  </dd>
                );
              })}
            </Fragment>
          );
        })}
      </dl>
    </div>
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

function categoryURL(name: string) {
  return `/oc-${name.replace(" ", "+")}`;
}
