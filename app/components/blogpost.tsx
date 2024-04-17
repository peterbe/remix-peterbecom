import { Link } from "@remix-run/react";
import { Fragment } from "react";

import type { Comments, Post } from "~/types";
import { categoryURL, formatDateBasic, postURL } from "~/utils/utils";

import { CarbonAd } from "./carbonad";
import { PostComments } from "./comments";
import { Nav } from "./nav";
import { Ping } from "./ping";
import { useRememberVisit } from "./remember-visit";
import { ScrollToTop } from "./scroll-to-top";

type Props = {
  post: Post;
  comments: Comments;
  page: number;
};
export function Blogpost({ post, comments, page }: Props) {
  const pubDate = new Date(post.pub_date);

  useRememberVisit(post);

  return (
    <div>
      <Nav
        title={post.title}
        subHead={
          <>
            <b>
              {pubDate.toLocaleDateString("en-us", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
                timeZone: "UTC", // So that it doesn't matter where in the world you are, it's always UTC
              })}
            </b>
            <br />
            <span>
              {`${comments.count} comment${comments.count === 1 ? "" : "s"}`}
            </span>{" "}
            <span>
              {post.categories.map((category, i, arr) => {
                return (
                  <Fragment key={category}>
                    <Link
                      to={categoryURL(category)}
                      rel="nofollow"
                      title={`Filter by the '${category}' category'`}
                      unstable_viewTransition
                    >
                      {category}
                    </Link>
                    {i < arr.length - 1 ? ", " : ""}
                  </Fragment>
                );
              })}
            </span>
          </>
        }
      />

      {post.url && <AboutPostURL url={post.url} />}

      <div dangerouslySetInnerHTML={{ __html: post.body }} />

      <CarbonAd />

      <PostComments post={post} comments={comments} page={page} />

      <RelatedPosts post={post} />

      {comments.count >= 10 && <ScrollToTop />}

      <Ping post={post} />
    </div>
  );
}

function AboutPostURL({ url }: { url: string }) {
  return (
    <p className="post-url">
      <b>URL:</b>{" "}
      <a href={url} rel="nofollow">
        {url}
      </a>
    </p>
  );
}

function RelatedPosts({ post }: { post: Post }) {
  const previousPost = post.previous_post;
  const nextPost = post.next_post;
  const relatedByCategory = post.related_by_category || [];
  const relatedByKeyword = post.related_by_keyword || [];

  return (
    <>
      <h2 className="ui dividing header">Related posts</h2>

      <dl className="related-posts">
        {previousPost && (
          <>
            <dt>Previous:</dt>
            <dd>
              <Link to={postURL(previousPost.oid)} unstable_viewTransition>
                {previousPost.title}
              </Link>{" "}
              <small>{formatDateBasic(previousPost.pub_date)}</small>{" "}
              <SubCategories categories={previousPost.categories || []} />
            </dd>
          </>
        )}

        {nextPost && (
          <>
            <dt>Next:</dt>
            <dd>
              <Link to={postURL(nextPost.oid)} unstable_viewTransition>
                {nextPost.title}
              </Link>{" "}
              <small>{formatDateBasic(nextPost.pub_date)}</small>{" "}
              <SubCategories categories={nextPost.categories || []} />
            </dd>
          </>
        )}
      </dl>

      {relatedByCategory.length > 0 && (
        <>
          <dl className="related-posts">
            <dt>Related by category:</dt>
            {relatedByCategory.map((related) => (
              <dd key={related.oid}>
                <Link to={postURL(related.oid)} unstable_viewTransition>
                  {related.title}
                </Link>{" "}
                <small>{formatDateBasic(related.pub_date)}</small>{" "}
                <SubCategories categories={related.categories || []} />
              </dd>
            ))}
          </dl>
        </>
      )}

      {relatedByKeyword.length > 0 && (
        <>
          <dl className="related-posts">
            <dt>Related by keyword:</dt>
            {relatedByKeyword.map((related) => (
              <dd key={related.oid}>
                <Link to={postURL(related.oid)} unstable_viewTransition>
                  {related.title}
                </Link>{" "}
                <small>{formatDateBasic(related.pub_date)}</small>{" "}
                <SubCategories categories={related.categories || []} />
              </dd>
            ))}
          </dl>
        </>
      )}
    </>
  );
}

function SubCategories({ categories }: { categories: string[] }) {
  return (
    <>
      {categories.map((category, i) => (
        <Fragment key={category}>
          <Link
            to={categoryURL(category)}
            title={`Filter by the '${category}' category`}
            unstable_viewTransition
          >
            <small>{category}</small>
          </Link>
          {i < categories.length - 1 && <small>, </small>}
        </Fragment>
      ))}
    </>
  );
}
