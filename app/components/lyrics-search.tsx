import { Fragment } from "react";

import type { LyricsSearchMetadata, LyricsSearchResult } from "~/valibot-types";

import { useSendPageview } from "../analytics";
import { CarbonAd } from "./carbonad";
// import { PostComments } from "./comments";
import { ScrollToTop } from "./scroll-to-top";

const PREFIX = "/plog/blogitem-040601-1";

type Props = {
  //   pageTitle: string;
  metadata: LyricsSearchMetadata;
  results: LyricsSearchResult[];
  page: number;
};
export function LyricsSearch({ metadata, results, page }: Props) {
  useSendPageview();

  const pageTitle = `"${metadata.search}" - Finding songs by lyrics`;

  return (
    <div className="lyrics-search">
      <CarbonAd />
      <hgroup>
        <h1>{pageTitle}</h1>
        {/* <h2>"{metadata.search}"</h2> */}
      </hgroup>

      {/* <SongSearchAutocomplete /> */}

      <Results results={results} metadata={metadata} page={page} />

      {/* <PostComments post={post} comments={comments} page={page} /> */}
      {metadata.total ? <Credit metadata={metadata} /> : null}

      {results.length > 10 ? <ScrollToTop /> : null}
    </div>
  );
}

function Results({
  results,
  metadata,
  page,
}: {
  results: LyricsSearchResult[];
  metadata: LyricsSearchMetadata;
  page: number;
}) {
  return (
    <div className="lyrics-search-results">
      <p>
        {metadata.total.toLocaleString()} songs found.{" "}
        {metadata.total > metadata.limit && (
          <span>Only showing the first {metadata.limit}.</span>
        )}{" "}
        <a href={PREFIX}>Go back to main blog post</a>
      </p>
      {results.map((result) => {
        return (
          <article key={result.id}>
            <header>
              {/* <a href={PREFIX + result._url}>
                <h2>
                  <b>{result.name}</b> by <b>{result.artist.name}</b>
                </h2>
              </a> */}
              <hgroup>
                <h2>
                  <a href={PREFIX + result._url}>{result.name}</a>
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
            <a href={PREFIX + result._url} style={{ float: "right" }}>
              <img src={result.image.thumbnail100} alt={result.image.name} />
            </a>
            {result.fragments.map((fragment, i) => (
              <p
                className="fragment"
                key={i}
                dangerouslySetInnerHTML={{ __html: fragment }}
              ></p>
            ))}
            <footer>
              <a href={result._url}>Go to song</a>
            </footer>
          </article>
        );
      })}
    </div>
  );
}

function Credit({ metadata }: { metadata: LyricsSearchMetadata }) {
  return (
    <p>
      <small>
        Showing search results from <a href="https://songsear.ch">SongSearch</a>
      </small>
    </p>
  );
}
