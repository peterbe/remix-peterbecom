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
                  <Link to={getPaginationURL(post.oid, comments.previous_page)}>
                    Page {comments.previous_page}
                  </Link>
                ) : (
                  <span>Page 1</span>
                )}
              </div>
              <div>
                {comments.next_page ? (
                  <Link to={getPaginationURL(post.oid, comments.next_page)}>
                    Page {comments.next_page}
                  </Link>
                ) : (
                  <span>Page {page}</span>
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
