import type { LyricsSearchMetadata, LyricsSearchResult } from "~/valibot-types";

import { useSendPageview } from "../analytics";
import { CarbonAd } from "./carbonad";
// import { PostComments } from "./comments";
import { ScrollToTop } from "./scroll-to-top";

type Props = {
  pageTitle: string;
  metadata: LyricsSearchMetadata;
  results: LyricsSearchResult[];
  page: number;
};
export function LyricsSearch({ pageTitle, metadata, results, page }: Props) {
  useSendPageview();

  return (
    <div>
      <hgroup>
        <h1>{pageTitle}</h1>
        {/* <h2>"{metadata.search}"</h2> */}
      </hgroup>

      {/* <SongSearchAutocomplete /> */}

      <CarbonAd />

      <Results results={results} page={page} />

      {/* <PostComments post={post} comments={comments} page={page} /> */}
      <Credit metadata={metadata} />

      <ScrollToTop />
    </div>
  );
}

function Results({
  results,
  page,
}: {
  results: LyricsSearchResult[];
  page: number;
}) {
  return (
    <div>
      {results.map((result) => {
        return (
          <article key={result.id}>
            <h2>{result.title}</h2>
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
