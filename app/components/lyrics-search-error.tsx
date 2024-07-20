import { useEffect } from "react";

import { sendEvent, useSendPageview } from "../analytics";

const PREFIX = "/plog/blogitem-040601-1";

type Props = {
  search: string;
  error: string;
};
export function LyricsSearchError({ error, search }: Props) {
  useSendPageview();
  useEffect(() => {
    sendEvent("search-error", { search, error });
  }, [search, error]);

  const pageTitle = `Search for "${search}" failed.`;

  return (
    <div className="lyrics-search-error" id="main-content">
      <article>
        <header>
          <h1>{pageTitle}</h1>
        </header>
        <p>The search unfortunately failed.</p>
        <pre>{error}</pre>
        <footer>
          <a href={PREFIX}>Go back to main blog post</a>
        </footer>
      </article>
    </div>
  );
}
