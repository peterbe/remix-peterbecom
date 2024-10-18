import { Link } from "@remix-run/react";
import { useCallback } from "react";

import { postURL } from "~/utils/utils";

import { LinkWithPrefetching } from "./link-with-prefetching";
import { type RememberedSearch, useRememberSearch } from "./remember-search";
import { type RememberedPost, useRecentVisits } from "./remember-visit";
import { SearchForm } from "./searchform";

type Props = {
  goTo: (url: string) => void;
};

export default function AutocompleteSearch({ goTo }: Props) {
  const { visited, clearVisited } = useRecentVisits();

  const { searches, clearSearches } = useRememberSearch();

  const recentSearches = searches;

  const goToCallback = useCallback((url: string) => goTo(url), [goTo]);

  return (
    <div style={{ minHeight: 600 }}>
      <SearchForm
        goTo={goToCallback}
        recentSearches={recentSearches}
        autofocus={true}
      />

      {visited.length > 0 && (
        <RecentVisits visited={visited} goTo={goToCallback} />
      )}
      {recentSearches.length > 0 && (
        <RecentSearches searches={recentSearches} goTo={goToCallback} />
      )}

      {(visited.length > 0 || recentSearches.length > 0) && (
        <Clear
          visited={visited}
          searches={recentSearches}
          clearSearches={clearSearches}
          clearVisited={clearVisited}
        />
      )}
    </div>
  );
}

function RecentHeading({ text }: { text: string }) {
  return <h4>{text}</h4>;
}

function RecentWrapper({ children }: { children: React.ReactNode }) {
  return <div style={{ marginTop: 30 }}>{children}</div>;
}

function RecentVisits({
  visited,
  goTo,
}: {
  visited: RememberedPost[];
  goTo: (url: string) => void;
}) {
  return (
    <RecentWrapper>
      <RecentHeading text="Recently visited" />

      {visited.map((doc) => {
        return (
          <p key={doc.oid} style={{ padding: 5, marginBottom: 10 }}>
            <LinkWithPrefetching
              to={postURL(doc.oid)}
              onClick={() => {
                goTo(postURL(doc.oid));
              }}
            >
              {doc.title}
            </LinkWithPrefetching>{" "}
            <small>{approximateVisited(doc.visited)}</small>
          </p>
        );
      })}
    </RecentWrapper>
  );
}

function RecentSearches({
  searches,
  goTo,
}: {
  searches: RememberedSearch[];
  goTo: (url: string) => void;
}) {
  return (
    <RecentWrapper>
      <RecentHeading text="Recent searches" />
      {searches.map((search, i) => {
        const url = `/search?${new URLSearchParams({ q: search.term }).toString()}`;
        return (
          <p key={search.term} style={{ padding: 5, marginBottom: 10 }}>
            <Link
              to={url}
              onClick={() => {
                goTo(url);
              }}
            >
              {search.term}
            </Link>{" "}
            <small>
              found {search.found} result
              {search.found === 1 ? "" : "s"} {approximateVisited(search.date)}
            </small>
          </p>
        );
      })}
    </RecentWrapper>
  );
}

function Clear({
  visited,
  searches,
  clearSearches,
  clearVisited,
}: {
  visited: RememberedPost[];
  searches: RememberedSearch[];
  clearSearches: () => void;
  clearVisited: () => void;
}) {
  return (
    <div>
      <fieldset role="group">
        {visited.length > 0 && (
          <button className="secondary outline" onClick={clearVisited}>
            Clear visited
          </button>
        )}
        {searches.length > 0 && (
          <button className="secondary outline" onClick={clearSearches}>
            Clear searches
          </button>
        )}
      </fieldset>
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
