import { Link, useNavigate, useNavigation } from "@remix-run/react";
import { Fragment, useEffect, useState } from "react";

import { useSendPageview } from "~/analytics";
import type {
  Document,
  SearchTerm,
  SearchTermBoosts,
  ServerData,
} from "~/search-types";
import { categoryURL, formatDateBasic } from "~/utils/utils";

import { LinkWithPrefetching } from "./link-with-prefetching";
import { Nav } from "./nav";
import { useRememberSearch } from "./remember-search";
import { SearchForm } from "./searchform";

interface Props {
  q: string | null;
  debug: boolean;
  searchResults: ServerData | null;
  searchError: Error | null;
}

export function Search({ q, debug, searchResults, searchError }: Props) {
  const navigate = useNavigate();
  const navigation = useNavigation();

  useSendPageview();

  let pageTitle = "Search";
  if (q && q.trim()) {
    if (q.startsWith('"') && q.endsWith('"')) {
      pageTitle = `Searching for ${q}`;
    } else {
      pageTitle = `Searching for "${q}"`;
    }
  }
  let extraHead = null;

  const isLoading = navigation.state === "loading";

  if (searchResults) {
    const found = searchResults.results.count_documents;
    const shown = searchResults.results.count_documents_shown;
    if (found === 1) {
      extraHead = "1 thing found";
    } else if (found > 1) {
      if (shown < found) {
        extraHead = `${found.toLocaleString()} things found (${shown} shown)`;
      } else {
        extraHead = `${found.toLocaleString()} things found`;
      }
    } else {
      extraHead = "Nothing found";
    }
  } else if (isLoading) {
    extraHead = "Hmmmmmm...";
  }

  const { rememberSearch } = useRememberSearch();
  const { searches } = useRememberSearch();

  useEffect(() => {
    if (q && searchResults) {
      rememberSearch({ term: q, found: searchResults.results.count_documents });
    }
  }, [q, searchResults]);

  useEffect(() => {
    if (q) {
      let title = `Searching for "${q}"`;
      if (searchResults) {
        title += ` (Found ${searchResults.results.count_documents.toLocaleString()})`;
      }
      document.title = title;
    }
  }, [q, searchResults]);

  return (
    <div>
      <Nav title={pageTitle} subHead={extraHead} />

      <SearchForm
        goTo={(url: string) => {
          navigate(url);
        }}
        recentSearches={searches}
        autofocus={!q}
      />

      {!q && (
        <p>
          Type in a search in the search box and hit <kbd>Enter</kbd>
        </p>
      )}

      {searchError && (
        <div>
          <h4 style={{ color: "red", marginBottom: 5 }}>Search error</h4>
          <p>
            An error occurred with the server for that search:
            <br />
            <code>{searchError.toString()}</code>
          </p>
        </div>
      )}

      {isLoading && <LoadingSpace />}

      {searchResults && (
        <div id="main-content">
          {searchResults.results.documents.map((result, i) => {
            const first = !i;
            let url = `/plog/${result.oid}`;
            if (result.comment_oid) {
              url += `#${result.comment_oid}`;
            }
            return (
              <div
                key={`${result.oid}${result.comment_oid}`}
                className="search-result"
              >
                <p>
                  <b>
                    <LinkWithPrefetching to={url} instant={first}>
                      <span
                        dangerouslySetInnerHTML={{ __html: result.title }}
                      />
                    </LinkWithPrefetching>
                  </b>{" "}
                  {debug && !result.comment_oid && (
                    <DebugResult document={result} />
                  )}
                  &nbsp;
                  {formatDateBasic(result.date)}
                  <br />
                  <LinkWithPrefetching
                    to={url}
                    className="search-result-url"
                    style={{ marginRight: 10 }}
                  >
                    {url}
                  </LinkWithPrefetching>{" "}
                  {(result.categories || []).map((category, i, arr) => {
                    return (
                      <Fragment key={category}>
                        <Link to={categoryURL(category)}>
                          <small>{category}</small>
                        </Link>
                        {i < arr.length - 1 ? ", " : ""}
                      </Fragment>
                    );
                  })}
                  <br />
                  <span
                    className="search-summary"
                    dangerouslySetInnerHTML={{ __html: result.summary }}
                  />
                </p>
              </div>
            );
          })}
        </div>
      )}

      {searchResults && !searchError && (
        <SearchMetaDetails
          found={searchResults.results.count_documents}
          seconds={searchResults.results.search_time}
        />
      )}

      {debug && searchResults && searchResults.results.search_terms && (
        <SearchTermDebugging
          searchTerms={searchResults.results.search_terms}
          boosts={searchResults.results?.search_term_boosts}
        />
      )}
    </div>
  );
}

function LoadingSpace() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    let mounted = true;

    const timer = setTimeout(() => {
      if (mounted) {
        setSeconds((prevState) => prevState + 1);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      mounted = false;
    };
  }, [seconds]);

  let statement = "";
  if (seconds > 6) {
    statement = "Man, this is taking ages!";
  } else if (seconds >= 2) {
    statement = "Still thinking about it...";
  }
  return (
    <div style={{ marginTop: 20, marginBottom: 600 }}>
      <p>{statement}</p>
    </div>
  );
}

function DebugResult({ document }: { document: Document }) {
  let color = null;
  if (document.score_boosted) {
    if (document.score_boosted > 0) {
      color = "green";
    } else if (document.score_boosted < 0) {
      color = "red";
    } else {
      color = "black";
    }
  }

  return (
    <small style={{ fontWeight: "normal" }}>
      <span
        className="tag tiny"
        title="Score straight from Elasticsearch's mouth"
      >
        Score {document.score.toFixed(6)}
      </span>{" "}
      <span className="tag tiny" title="Popularity of document">
        Popularity {(document.popularity || 0.0).toFixed(6)} (
        {document.popularity_ranking})
      </span>{" "}
      <b
        className="tag tiny"
        title="Change thanks to popularity"
        style={color ? { color } : undefined}
      >
        {document.score_boosted}
      </b>
    </small>
  );
}

function SearchTermDebugging({
  searchTerms,
  boosts,
}: {
  searchTerms: SearchTerm[];
  boosts: SearchTermBoosts;
}) {
  return (
    <div>
      <p>
        <b>Search Term Debugging</b>
      </p>
      <table role="grid">
        <thead>
          <tr>
            <th>Search Term</th>
            <th>Search Term Score</th>
            <th>Title Boost</th>
            <th>Text Boost</th>
          </tr>
        </thead>
        <tbody>
          {searchTerms.map(([score, term]) => {
            return (
              <tr key={`${term}${score}`}>
                <td>
                  <code>{term}</code>
                </td>
                <td>{score.toFixed(1)}</td>
                <td>{term in boosts && boosts[term][0].toFixed(1)}</td>
                <td>{term in boosts && boosts[term][1].toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SearchMetaDetails({
  found,
  seconds,
}: {
  found: number;
  seconds: number;
}) {
  return (
    <p>
      <small>
        {found.toLocaleString()} matches in {seconds.toFixed(2)} seconds
      </small>
    </p>
  );
}
