import { Link } from "@remix-run/react";
import { Fragment } from "react";

import type { Group } from "~/types";

import { Nav } from "./nav";
import { categoryURL, formatDate } from "~/utils/utils";

type Props = {
  groups: Group[];
};

const intl = new Intl.NumberFormat("en-us");

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
                const count = `${intl.format(post.comments)} comment${
                  post.comments === 1 ? "" : "s"
                }`;
                return (
                  <dd key={post.oid}>
                    <Link to={`/plog/${post.oid}`}>{post.title}</Link>{" "}
                    {post.comments > 0 && <span>{count}</span>}{" "}
                    <small>
                      {post.categories.map((name, i, arr) => (
                        <Fragment key={name}>
                          <Link to={categoryURL(name)} rel="nofollow">
                            {name}
                          </Link>
                          {i < arr.length - 1 ? ", " : ""}
                        </Fragment>
                      ))}
                    </small>
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
