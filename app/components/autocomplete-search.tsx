import { Link } from "@remix-run/react";
import { useCallback } from "react";

import { postURL } from "~/utils/utils";

import { type RememberedPost, useRecentVisits } from "./remember-visit";
import { SearchForm } from "./searchform";

type Props = {
  goTo: (url: string) => void;
};

export default function AutocompleteSearch({ goTo }: Props) {
  const { visited, clearVisited, undoClearVisited, undoable } =
    useRecentVisits();

  const goToCallback = useCallback((url: string) => goTo(url), [goTo]);

  return (
    <div style={{ minHeight: 600 }}>
      <SearchForm goTo={goToCallback} autofocus={true} />

      {visited.length > 0 && (
        <RecentVisits
          visited={visited}
          clearVisited={clearVisited}
          undoClearVisited={undoClearVisited}
          undoable={undoable}
          goTo={goToCallback}
        />
      )}
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
