import { Link } from "@remix-run/react";
import { Fragment, useEffect, useState } from "react";

import { DisplayComment } from "~/components/comment";
import { CommentForm } from "~/components/commentform";
import type {
  AddOwnCommentProps,
  Comment,
  Comments,
  OwnComment,
  Post,
} from "~/types";
import { Message } from "~/utils/message";

type Props = {
  post: Post;
  comments: Comments;
  page: number;
};
export function PostComments({ post, comments, page }: Props) {
  const disallowComments = post.disallow_comments;
  const hideComments = post.hide_comments;
  const [parent, setParent] = useState<string | null>(null);
  const totalPages =
    comments.truncated && comments.truncated !== true
      ? Math.ceil(comments.count / comments.truncated)
      : 1;

  if (hideComments && disallowComments) {
    return (
      <p>
        <em>Comments closed for this page</em>
      </p>
    );
  }

  return (
    <div id="comments">
      <Heading
        page={page}
        totalPages={totalPages}
        oid={post.oid}
        nextPage={comments.next_page}
        prevPage={comments.previous_page}
      />

      {hideComments && comments.count && (
        <p>
          <em>Comments hidden. Sorry.</em>
        </p>
      )}
      {!hideComments && (
        <div id="comments-outer" className="comments">
          <ShowCommentTree
            post={post}
            comments={comments.tree}
            disallowComments={disallowComments}
            setParent={setParent}
            parent={parent}
          />
        </div>
      )}

      {disallowComments && (
        <p>
          <em>Comments closed</em>
        </p>
      )}
    </div>
  );
}

function Heading({
  page,
  totalPages,
  oid,
  nextPage,
  prevPage,
}: {
  page: number;
  totalPages: number;
  oid: string;
  nextPage: number | null;
  prevPage: number | null;
}) {
  if (totalPages === 1) return <h2>Comments</h2>;

  return (
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
            {prevPage ? (
              <Link
                to={getPaginationURL(oid, prevPage)}
                role="button"
                className="mini"
              >
                Page {prevPage}
              </Link>
            ) : (
              <a
                href={getPaginationURL(oid, 1)}
                onClick={(event) => event.preventDefault()}
                role="button"
                className="secondary outline mini"
                aria-disabled="true"
              >
                Page 1
              </a>
            )}
          </div>
          <div>
            {nextPage ? (
              <Link
                to={getPaginationURL(oid, nextPage)}
                role="button"
                className="mini"
              >
                Page {nextPage}
              </Link>
            ) : (
              <a
                href={getPaginationURL(oid, page)}
                onClick={(event) => event.preventDefault()}
                role="button"
                className="secondary outline mini"
                aria-disabled="true"
              >
                Page {page}
              </a>
            )}
          </div>
        </div>
      </div>
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

function ShowCommentTree({
  post,
  comments,
  disallowComments,
  setParent,
  parent,
  root = true,
}: {
  post: Post;
  comments: Comment[];
  disallowComments: boolean;
  setParent: (oid: string | null) => void;
  parent: string | null;
  root?: boolean;
}) {
  const [ownComments, setOwnComments] = useState<OwnComment[]>([]);
  const [submitted, setSubmitted] = useState<string | boolean | null>(null);

  function addOwnComment({
    oid,
    renderedComment,
    hash,
    comment,
    name,
    email,
    depth,
    parent,
  }: AddOwnCommentProps) {
    setOwnComments((prevState) => {
      const newComments: OwnComment[] = [];
      const newComment: OwnComment = {
        oid,
        hash,
        renderedComment,
        comment,
        name,
        email,
        parent,
        depth,
        postOid: post.oid,
      };
      let edited = false;
      for (const ownComment of prevState) {
        if (ownComment.hash === hash) {
          newComments.push(newComment);
          edited = true;
        } else {
          newComments.push(ownComment);
        }
      }
      if (!edited) {
        newComments.push(newComment);
      }
      return newComments;
    });
  }

  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (mounted) {
        setSubmitted(null);
      }
    }, 5 * 1000);
    return () => {
      mounted = false;
    };
  }, [submitted]);

  return (
    <>
      {comments.map((comment) => {
        return (
          <Fragment key={comment.id}>
            <DisplayComment
              comment={comment}
              disallowComments={disallowComments}
              setParent={setParent}
              notApproved={false}
              parent={parent}
              allowReply={true}
            >
              {submitted === comment.oid && (
                <Message
                  onClose={() => setSubmitted(null)}
                  header="Reply comment submitted"
                  positive={true}
                >
                  It will be manually reviewed shortly.
                </Message>
              )}
              {parent && parent === comment.oid && !disallowComments && (
                <>
                  <CommentForm
                    parent={parent}
                    post={post}
                    addOwnComment={addOwnComment}
                    setParent={setParent}
                    depth={comment.depth + 1}
                    onSubmitted={() => {
                      setSubmitted(comment.oid);
                    }}
                  />
                </>
              )}
            </DisplayComment>

            {comment.replies && (
              <ShowCommentTree
                post={post}
                comments={comment.replies}
                disallowComments={disallowComments}
                setParent={setParent}
                parent={parent}
                root={false}
              />
            )}

            {ownComments
              .filter((c) => c.parent === comment.oid && c.postOid === post.oid)
              .map((ownComment) => {
                return (
                  <DisplayOwnComment
                    key={ownComment.oid}
                    ownComment={ownComment}
                    addOwnComment={addOwnComment}
                    post={post}
                  />
                );
              })}
          </Fragment>
        );
      })}

      {submitted === true && (
        <Message
          onClose={() => setSubmitted(null)}
          header="Comment submitted"
          positive={true}
        >
          It will be manually reviewed shortly.
        </Message>
      )}

      {ownComments
        .filter((c) => c.parent === null && c.postOid === post.oid)
        .map((ownComment) => {
          return (
            <DisplayOwnComment
              key={ownComment.oid}
              ownComment={ownComment}
              addOwnComment={addOwnComment}
              post={post}
            />
          );
        })}

      {!parent && root && !disallowComments && (
        <div id="commentsform">
          <CommentForm
            parent={parent}
            post={post}
            addOwnComment={addOwnComment}
            setParent={setParent}
            depth={0}
            onSubmitted={() => {
              setSubmitted(true);
            }}
          />
        </div>
      )}
    </>
  );
}

function DisplayOwnComment({
  ownComment,
  addOwnComment,
  post,
}: {
  ownComment: OwnComment;
  addOwnComment: (props: AddOwnCommentProps) => void;
  post: Post;
}) {
  const [editMode, setEditMode] = useState(false);
  if (editMode) {
    return (
      <CommentForm
        editHash={ownComment.hash}
        parent={ownComment.parent}
        addOwnComment={addOwnComment}
        onSubmitted={() => {
          setEditMode(false);
        }}
        initialComment={ownComment.comment}
        initialName={ownComment.name}
        initialEmail={ownComment.email}
        depth={ownComment.depth}
        setParent={() => {}}
        post={post}
      />
    );
  }
  return (
    <DisplayComment
      key={ownComment.oid}
      comment={{
        id: 0,
        oid: ownComment.oid,
        comment: ownComment.renderedComment,
        add_date: new Date().toISOString(),
        not_approved: true,
        depth: ownComment.depth,
        name: ownComment.name,
      }}
      disallowComments={false}
      allowReply={false}
      notApproved={true}
      setParent={() => {}}
      parent={null}
      toggleEditMode={() => {
        setEditMode((prevState) => !prevState);
      }}
    ></DisplayComment>
  );
}
