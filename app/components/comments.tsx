import { Link } from "@remix-run/react";
import type { Comments, Post } from "~/types";

type Props = {
  post: Post;
  comments: Comments;
  page: number;
};
export function PostComments({ post, comments, page }: Props) {
  const totalPages =
    comments.truncated && comments.truncated !== true
      ? Math.ceil(comments.count / comments.truncated)
      : 1;

  return (
    <div id="comments">
      {totalPages === 1 && <h2>Comments</h2>}
      {totalPages > 1 && (
        <div className="grid">
          <div>
            <hgroup>
              <h2>Comments</h2>
              <h3>
                Page {page} <span>of {totalPages}</span>
              </h3>
            </hgroup>
          </div>
          <div>
            <div className="grid">
              <div>
                {comments.previous_page ? (
                  <Link
                    to={getPaginationURL(post.oid, comments.previous_page)}
                    role="button"
                  >
                    Page {comments.previous_page}
                  </Link>
                ) : (
                  <a
                    href={getPaginationURL(post.oid, 1)}
                    onClick={(event) => event.preventDefault()}
                    role="button"
                    className="secondary outline"
                    aria-disabled="true"
                  >
                    Page 1
                  </a>
                )}
              </div>
              <div>
                {comments.next_page ? (
                  <Link
                    to={getPaginationURL(post.oid, comments.next_page)}
                    role="button"
                  >
                    Page {comments.next_page}
                  </Link>
                ) : (
                  <a
                    href={getPaginationURL(post.oid, page)}
                    onClick={(event) => event.preventDefault()}
                    role="button"
                    className="secondary outline"
                    aria-disabled="true"
                  >
                    Page {page}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getPaginationURL(oid: string, page: number) {
  let start = `/plog/${oid}`;
  if (page !== 1) {
    start += `/p${page}`;
  }
  return `${start}#comments`;
}
