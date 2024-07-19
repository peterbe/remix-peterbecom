import { Fragment } from "react";

import type { LyricsSearchMetadata, LyricsSearchResult } from "~/valibot-types";

import { useSendPageview } from "../analytics";
import { CarbonAd } from "./carbonad";
import { ScrollToTop } from "./scroll-to-top";

const PREFIX = "/plog/blogitem-040601-1";

type Props = {
  metadata: LyricsSearchMetadata;
  results: LyricsSearchResult[];
  page: number;
};
export function LyricsSearch({ metadata, results, page }: Props) {
  useSendPageview();

  const pageTitle = `"${metadata.search}" - Finding songs by lyrics`;

  return (
    <div className="lyrics-search">
      <div style={{ float: "right" }}>
        <CarbonAd />
      </div>

      <div id="main-content">
        <hgroup>
          <h1>{pageTitle}</h1>
        </hgroup>

        <Results results={results} metadata={metadata} />

        {metadata.total ? <Credit /> : null}

        {results.length > 10 ? <ScrollToTop /> : null}
      </div>
    </div>
  );
}

function Results({
  results,
  metadata,
}: {
  results: LyricsSearchResult[];
  metadata: LyricsSearchMetadata;
}) {
  function makeURL(url: string) {
    if (metadata.search) {
      url += `?${new URLSearchParams({ search: metadata.search })}`;
    }
    return `${PREFIX}${url}`;
  }
  return (
    <div className="lyrics-search-results">
      <p>
        {metadata.total.toLocaleString()} songs found.{" "}
        {metadata.total > metadata.limit && (
          <span>Only showing the first {metadata.limit}.</span>
        )}
      </p>
      <p>
        <a href={PREFIX}>Go back to main blog post</a>
      </p>
      {results.map((result) => {
        return (
          <article key={result.id}>
            <header>
              <hgroup>
                <h2>
                  <a href={makeURL(result._url)}>{result.name}</a>
                </h2>
                <h3 style={{ fontSize: "1.2rem" }}>
                  By <b>{result.artist.name}</b>{" "}
                  {result.year && `(${result.year})`}
                </h3>
                {result.albums.length > 0 && (
                  <p>
                    On album{" "}
                    {result.albums.map((album, i) => (
                      <Fragment key={album.name + i}>
                        <b>{album.name}</b> {album.year && `(${album.year})`}{" "}
                      </Fragment>
                    ))}
                  </p>
                )}
              </hgroup>
            </header>
            <a href={makeURL(result._url)} style={{ float: "right" }}>
              <img
                src={result.image.thumbnail100 || result.image.url}
                alt={result.image.name}
                width={!result.image.thumbnail100 ? 100 : undefined}
              />
            </a>
            {result.fragments.map((fragment, i) => (
              <p
                className="fragment"
                key={i}
                dangerouslySetInnerHTML={{ __html: fragment }}
              ></p>
            ))}
            <footer>
              <a href={makeURL(result._url)}>Go to song</a>
            </footer>
          </article>
        );
      })}
    </div>
  );
}

function Credit() {
  return (
    <p style={{ marginTop: 100 }}>
      <small>
        Showing search results from <a href="https://songsear.ch">SongSearch</a>
      </small>
    </p>
  );
}
