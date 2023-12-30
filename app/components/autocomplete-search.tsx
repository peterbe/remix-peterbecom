import { Link } from "@remix-run/react";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useDebounce } from "usehooks-ts";

import { postURL } from "~/utils/utils";

import { type RememberedPost, useRecentVisits } from "./remember-visit";

function searchURL(q: string) {
  return `/search?${new URLSearchParams({ q }).toString()}`;
}

type SearchMeta = {
  found: number;
};

type TypeaheadResult = {
  term: string;
  highlights: string[];
};

type ServerData = {
  results: TypeaheadResult[];
  meta: SearchMeta;
};

type Props = {
  goTo: (url: string) => void;
};

export default function AutocompleteSearch({ goTo }: Props) {
  const { visited, clearVisited, undoClearVisited, undoable } =
    useRecentVisits();

  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const debouncedInput = useDebounce<string>(input, 100);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const apiURL = debouncedInput.trim()
    ? `/api/v1/typeahead?${new URLSearchParams({
        q: debouncedInput.trim(),
      }).toString()}`
    : null;

  const { data, error } = useSWR<ServerData, Error>(
    apiURL,
    async (url) => {
      const r = await fetch(url);
      if (!r.ok) {
        throw new Error(`${r.status} on ${url}`);
      }
      return r.json();
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  const [highlight, setHighlight] = useState(-1);
  const goToCallback = useCallback((url: string) => goTo(url), [goTo]);

  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        if (data) {
          setHighlight((highlight) =>
            Math.min(data.results.length - 1, highlight + 1),
          );
          e.preventDefault();
        }
      } else if (e.key === "ArrowUp") {
        setHighlight((highlight) => Math.max(-1, highlight - 1));
        e.preventDefault();
      } else if (e.key === "Enter") {
        if (data && highlight > -1) {
          goToCallback(searchURL(data.results[highlight].term));
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [data, highlight, goToCallback]);

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (highlight === -1) {
            goTo(searchURL(input));
          } else if (data && data.results && data.results[highlight]) {
            goTo(searchURL(data.results[highlight].term));
          }
        }}
      >
        <input
          type="search"
          name="q"
          placeholder="Search"
          ref={inputRef}
          onChange={(event) => {
            setInput(event.target.value);
          }}
        />
      </form>

      {!input.trim() && (visited.length > 0 || undoable) && (
        <RecentVisits
          visited={visited}
          clearVisited={clearVisited}
          undoClearVisited={undoClearVisited}
          undoable={undoable}
          goTo={goToCallback}
        />
      )}

      {error && <SearchError error={error} input={input} />}
      {input.trim() && data && data.results && (
        <TypeaheadResults
          results={data.results}
          meta={data.meta}
          highlight={highlight}
          goTo={goToCallback}
        />
      )}
      {data && input.trim() && <FullSearchLink input={input} />}
    </div>
  );
}

function FullSearchLink({ input }: { input: string }) {
  return (
    <p style={{ margin: 20, textAlign: "center", fontStyle: "italic" }}>
      <Link to={searchURL(input)}>
        Search for "<em>{input}</em>"
      </Link>
    </p>
  );
}

function SearchError({ error, input }: { error: Error; input: string }) {
  return (
    <div>
      <p>
        <strong>Error</strong>
      </p>
      <p style={{ color: "red" }}>{error.message}</p>
      <FullSearchLink input={input} />
    </div>
  );
}

function RecentVisits({
  visited,
  clearVisited,
  undoClearVisited,
  undoable,
  goTo,
}: {
  visited: RememberedPost[];
  clearVisited: () => void;
  undoClearVisited: () => void;
  undoable: boolean;
  goTo: (url: string) => void;
}) {
  return (
    <div>
      <p style={{ textAlign: "right", fontSize: "0.8rem", marginBottom: 0 }}>
        Recently visited
      </p>
      {visited.map((doc, i) => {
        return (
          <p key={doc.oid} style={{ padding: 5, marginBottom: 10 }}>
            <Link
              to={postURL(doc.oid)}
              onClick={() => {
                goTo(postURL(doc.oid));
              }}
            >
              {doc.title}
            </Link>{" "}
            <small>{approximateVisited(doc.visited)}</small>
          </p>
        );
      })}
      {undoable && (
        <button className="secondary outline" onClick={undoClearVisited}>
          Undo clear
        </button>
      )}
      {visited.length > 0 && (
        <button className="secondary outline" onClick={clearVisited}>
          Clear visited
        </button>
      )}
    </div>
  );
}

function approximateVisited(date: string) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (isNaN(diff)) {
    return "";
  }
  const diffSeconds = diff / 1000;
  if (diffSeconds < 60) {
    return "seconds ago";
  }
  const diffMinutes = diffSeconds / 60;
  if (diffMinutes < 60) {
    return "minutes ago";
  }
  const diffHours = diffMinutes / 60;
  if (diffHours < 24) {
    return "hours ago";
  }
  const diffDays = diffHours / 24;
  if (diffDays < 7) {
    return "days ago";
  }

  return "ages ago";
}

function TypeaheadResults({
  results,
  meta,
  highlight,
  goTo,
}: {
  results: TypeaheadResult[];
  meta: SearchMeta;
  highlight: number;
  goTo: (url: string) => void;
}) {
  return (
    <div>
      <p style={{ textAlign: "right", fontSize: "0.8rem", marginBottom: 0 }}>
        {meta.found.toLocaleString()} suggestions
      </p>
      {results.map((doc, i) => {
        return (
          <p
            key={doc.term}
            style={
              i === highlight
                ? {
                    backgroundColor: "var(--code-background-color)",
                    padding: 5,
                    marginBottom: 0,
                  }
                : { padding: 5, marginBottom: 0 }
            }
          >
            <Link
              to={searchURL(doc.term)}
              onClick={() => {
                goTo(searchURL(doc.term));
              }}
              dangerouslySetInnerHTML={{
                __html: doc.highlights.length ? doc.highlights[0] : doc.term,
              }}
            ></Link>
          </p>
        );
      })}
    </div>
  );
}
