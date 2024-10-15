import { Link } from "@remix-run/react";
import { Fragment } from "react";

import { useSendPageview } from "~/analytics";
import type { Group } from "~/types";
import { categoryURL, postURL } from "~/utils/utils";

import { Nav } from "./nav";

type Props = {
  groups: Group[];
};

const intl = new Intl.NumberFormat("en-us");

export function BlogArchive({ groups }: Props) {
  useSendPageview();
  return (
    <div>
      <Nav title="Blog archive" />

      <dl id="main-content">
        {groups.map(({ date, posts }) => {
          return (
            <Fragment key={date}>
              <dt>{formatDateShort(date)}</dt>
              {posts.map((post) => {
                const count = `${intl.format(post.comments)} comment${
                  post.comments === 1 ? "" : "s"
                }`;
                return (
                  <dd key={post.oid}>
                    <Link to={postURL(post.oid)} viewTransition>
                      {post.title}
                    </Link>{" "}
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

// The date string here is of the format "YYYY.MM"
// From that format it as "May 2023"
function formatDateShort(date: string) {
  const split = date.split(".");
  if (split.length !== 2) {
    return date;
  }
  const [year, month] = split;
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
  const monthNumber = parseInt(month, 10);
  if (monthNames[monthNumber - 1]) {
    return `${monthNames[monthNumber - 1]} ${year}`;
  }
  return `${month} ${year}`;
}
