import { Link, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { useQueryBoolean, useQueryString } from "~/hooks/use-query-hook";
import { formatDateBasic } from "~/utils/utils";

import { Nav } from "./nav";

interface Document {
  oid: string;
  title: string;
  date: string;
  comment_oid: string | null;
  summary: string;

  score: number;
  score_boosted?: number;
  popularity?: number;
  popularity_ranking?: number;
}

type SearchTerm = [number, string];

type SearchTermBoosts = {
  [key: string]: [number, number];
};

interface SearchResult {
  count_documents: number;
  count_documents_shown: number;
  documents: Document[];
  search_time: number;
  search_terms: SearchTerm[];
  search_term_boosts: SearchTermBoosts;
}

interface ServerData {
  results: SearchResult;
}

export function Search() {
  const [, setSearchParams] = useSearchParams();
  const q = useQueryString("q");
  const [qInput, setQInput] = useState(q || "");
  const debug = useQueryBoolean("debug");

  const pageTitle = q && q.trim() ? `Searching for "${q}"` : "Search";
  let extraHead = null;
  const baseURL = "https://www.peterbe.com";

  const apiURL =
    q && q.trim()
      ? `/api/v1/search?${new URLSearchParams({
          q: q.trim(),
          debug: JSON.stringify(debug),
        }).toString()}`
      : null;

  const { data, error, isLoading } = useSWR<ServerData, Error>(
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
    }
  );

  if (data && data.results) {
    const found = data.results.count_documents;
    const shown = data.results.count_documents_shown;
    if (found === 1) {
      extraHead = "1 thing found";
    } else if (found > 1) {
      if (shown < found) {
        extraHead = `${found} things found (${shown} shown)`;
      } else {
        extraHead = `${found} things found`;
      }
    } else {
      extraHead = "Nothing found";
    }
  } else if (isLoading) {
    extraHead = "Hmmmmmm...";
  }

  useEffect(() => {
    if (q) {
      if (data) {
        document.title = `Found ${data.results.count_documents} for "${q}"`;
      } else {
        document.title = `Searching for "${q}"`;
      }
    }
  }, [q, data]);

  return (
    <div>
      <Nav title={pageTitle} subHead={extraHead} />

      {error && (
        <div>
          <h4 style={{ color: "red", marginBottom: 5 }}>Search error</h4>
          <p>
            An error occurred with the server for that search:
            <br />
            <code>{error.toString()}</code>
          </p>
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (qInput.trim()) {
            setSearchParams({ q: qInput.trim() });
          } else {
            setSearchParams({});
          }
        }}
      >
        <input
          type="search"
          name="q"
          placeholder="Search..."
          value={qInput}
          onChange={(event) => setQInput(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {isLoading && <LoadingSpace />}

      {data && data.results && (
        <div>
          {data.results.documents.map((result) => {
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
                    <Link
                      to={url}
                      dangerouslySetInnerHTML={{ __html: result.title }}
                    ></Link>
                  </b>{" "}
                  {debug && !result.comment_oid && (
                    <DebugResult document={result} />
                  )}
                  &nbsp;
                  <small>{formatDateBasic(result.date)}</small>
                  <br />
                  <Link to={url} className="search-result-url">
                    {baseURL}
                    {url}
                  </Link>
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

      {data && data.results && !error && (
        <SearchMetaDetails
          found={data.results.count_documents}
          seconds={data.results.search_time}
        />
      )}

      {debug && data && data.results && data.results.search_terms && (
        <SearchTermDebugging
          searchTerms={data.results.search_terms}
          boosts={data.results?.search_term_boosts}
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
        className="ui tag tiny label"
        title="Score straight from Elasticsearch's mouth"
      >
        Score {document.score.toFixed(6)}
      </span>{" "}
      <span className="ui tag tiny label" title="Popularity of document">
        Popularity {(document.popularity || 0.0).toFixed(6)} (
        {document.popularity_ranking})
      </span>{" "}
      <b
        className="ui tag tiny label"
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
    <>
      <p>
        <small>Search Term Debugging</small>
      </p>
      <table className="ui celled table">
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
    </>
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
