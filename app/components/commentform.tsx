import { useEffect, useRef, useState } from "react";
import * as v from "valibot";

import type { AddOwnCommentProps } from "~/types";
import { Message } from "~/utils/message";
import { handleValiError } from "~/utils/utils";
import type { Post } from "~/valibot-types";
import { PrepareData, PreviewData, SubmitData } from "~/valibot-types";

import { DisplayComment } from "./comment";

const LOCALESTORAGE_NAME_KEY = "commenting";

type RememberedName = {
  name: string;
  email: string;
};
function getRememberedName(): RememberedName {
  const res: RememberedName = {
    name: "",
    email: "",
  };
  try {
    const serialized = localStorage.getItem(LOCALESTORAGE_NAME_KEY);
    if (serialized) {
      const remembered = JSON.parse(serialized);
      if (remembered.name) {
        res.name = remembered.name;
      }
      if (remembered.email) {
        res.email = remembered.email;
      }
    }
  } catch (error) {
    console.warn("Unable to read from localStorage");
  }
  return res;
}

export function CommentForm({
  parent,
  post,
  addOwnComment,
  editHash,
  initialComment = "",
  initialEmail = "",
  initialName = "",
  depth,
  setParent,
  onSubmitted,
}: {
  parent: string | null;
  post: Post;
  editHash?: string;
  addOwnComment: (props: AddOwnCommentProps) => void;
  initialComment?: string;
  initialEmail?: string;
  initialName?: string;
  depth: number;
  setParent: (oid: string | null) => void;
  onSubmitted?: () => void;
}) {
  const [comment, setComment] = useState(initialComment);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  useEffect(() => {
    const { name, email } = getRememberedName();
    if (name) {
      setName(name);
    }
    if (email) {
      setEmail(email);
    }
  }, []);

  const textareaRef = useRef<null | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (parent || editHash) {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        if (editHash) {
          textarea.setSelectionRange(
            textarea.value.length,
            textarea.value.length,
          );
        }
      }
    }
  }, [parent, editHash]);

  const [csrfmiddlewaretoken, setCsrfmiddlewaretoken] = useState("");
  const [csrfmiddlewaretokenTimestamp, setCsrfmiddlewaretokenTimestamp] =
    useState<Date | null>(null);

  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [renderedComment, setRenderedComment] = useState("");
  const [previewError, setPreviewError] = useState<Error | null>(null);
  const [prepareError, setPrepareError] = useState<Error | null>(null);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  async function prepare() {
    if (csrfmiddlewaretoken && csrfmiddlewaretokenTimestamp) {
      const ageSeconds =
        (new Date().getTime() - csrfmiddlewaretokenTimestamp.getTime()) / 1000;
      if (ageSeconds < 60) {
        return;
      }
    }
    const response = await fetch("/api/v1/plog/comments/prepare");
    if (!response.ok) {
      setPrepareError(new Error(`${response.status}`));
    } else {
      const posted = await response.json();
      try {
        const { csrfmiddlewaretoken } = v.parse(PrepareData, posted);
        setCsrfmiddlewaretoken(csrfmiddlewaretoken);
        setCsrfmiddlewaretokenTimestamp(new Date());
      } catch (error) {
        handleValiError(error);
        throw error;
      }
    }
  }

  async function preview() {
    const body = new FormData();
    body.append("comment", comment);
    const response = await fetch("/api/v1/plog/comments/preview", {
      method: "POST",
      body,
      headers: {
        "X-CSRFToken": csrfmiddlewaretoken,
      },
    });
    if (!response.ok) {
      setPreviewError(new Error(`${response.status}`));
    } else {
      const posted = await response.json();
      try {
        const { comment } = v.parse(PreviewData, posted);
        setRenderedComment(comment);
        setPreviewError(null);
      } catch (error) {
        handleValiError(error);
        throw error;
      }
    }
  }

  async function submit() {
    await prepare(); // idempotent and fast
    const body = new FormData();
    body.append("oid", post.oid);
    body.append("comment", comment.trim());
    body.append("name", name.trim());
    body.append("email", email.trim());
    if (parent) {
      body.append("parent", parent);
    }
    if (editHash) {
      body.append("hash", editHash);
    }
    const response = await fetch("/api/v1/plog/comments/submit", {
      method: "POST",
      body,
      headers: {
        "X-CSRFToken": csrfmiddlewaretoken,
      },
    });
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    setSubmitError(null);

    const posted = await response.json();
    try {
      const { oid, comment, hash } = v.parse(SubmitData, posted);

      addOwnComment({
        oid,
        renderedComment: comment,
        hash,
        comment,
        name,
        email,
        depth,
        parent,
      });
    } catch (error) {
      handleValiError(error);
      throw error;
    }
  }

  function rememberName() {
    if (name.trim() || email.trim()) {
      try {
        localStorage.setItem(
          LOCALESTORAGE_NAME_KEY,
          JSON.stringify({ name, email }),
        );
      } catch (error) {
        console.warn("Unable to save in localStorage");
      }
    } else {
      try {
        localStorage.removeItem(LOCALESTORAGE_NAME_KEY);
      } catch (error) {
        console.warn("Unable to save in localStorage");
      }
    }
  }

  return (
    <>
      {renderedComment && (
        <DisplayComment
          comment={{
            id: 0,
            oid: "mock",
            comment: renderedComment,
            add_date: new Date().toString(),
            depth: 0,
            name,
          }}
          setParent={() => {}}
          notApproved={false}
          disallowComments={true}
          parent={null}
        ></DisplayComment>
      )}

      {prepareError && (
        <Message
          onClose={() => setPrepareError(null)}
          warning={true}
          header="Unable to prepare for commenting at the moment"
          body="Try reloading the page."
        />
      )}

      {submitError && (
        <Message
          onClose={() => setSubmitError(null)}
          header="Sorry. The comment couldn't be posted."
          body={
            <>
              <p>An error occurred trying to send this to the server.</p>
              <p>
                <code>{submitError.toString()}</code>
              </p>
            </>
          }
          negative={true}
        />
      )}

      {previewError && (
        <Message
          onClose={() => setPreviewError(null)}
          negative={true}
          header="Sorry. The comment couldn't be previewed."
          body={
            <>
              <p>An error occurred trying to send this to the server.</p>
              <p>
                <code>{previewError.toString()}</code>
              </p>
            </>
          }
        />
      )}

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (!comment.trim()) return;
          setSubmitting(true);
          try {
            await submit();
            setSubmitting(false);
            setRenderedComment("");
            if (parent) {
              setParent(null);
            } else {
              setComment("");
            }
            if (onSubmitted) {
              onSubmitted();
            }
          } catch (error) {
            setSubmitting(false);
            if (error instanceof Error) {
              setSubmitError(error);
            } else {
              throw error;
            }
          }
        }}
        style={{ marginTop: 40 }}
      >
        <div className="field">
          <label>What do you think?</label>
          <textarea
            ref={textareaRef}
            name="comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            onFocus={() => {
              prepare();
            }}
            rows={5}
            aria-label="Your comment"
          ></textarea>
        </div>

        <div className="field">
          <input
            name="name"
            aria-label="Your full name"
            placeholder="Your full name"
            title="Your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={rememberName}
          />
          <input
            type="email"
            name="email"
            aria-label="Your email"
            placeholder="Your email (never shown, never shared)"
            title="Your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={rememberName}
          />
          <button
            type="button"
            className={!renderedComment ? "primary" : undefined}
            disabled={previewing || !comment.trim()}
            onClick={async (event) => {
              event.preventDefault();
              if (!comment.trim()) return;
              setPreviewing(true);
              try {
                await prepare();
                await preview();
              } finally {
                setPreviewing(false);
              }
            }}
          >
            {renderedComment ? "Preview again" : "Preview first"}
          </button>
          <button
            type="submit"
            className={`post ${renderedComment ? "primary" : ""}`}
            disabled={submitting || !comment.trim()}
          >
            {editHash
              ? submitting
                ? "Saving changes"
                : "Save changes"
              : submitting
                ? "Posting comment"
                : "Post comment"}
          </button>

          <p className="note-about-email">
            Your email will never ever be published.
          </p>
        </div>
      </form>
    </>
  );
}
