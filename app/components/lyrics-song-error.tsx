import { useEffect } from "react";

import { sendEvent, useSendPageview } from "../analytics";

const PREFIX = "/plog/blogitem-040601-1";

type Props = {
  error: string;
};
export function LyricsSongError({ error }: Props) {
  useSendPageview();

  useEffect(() => {
    sendEvent("search-error", { error });
  }, [error]);

  const pageTitle = "Song lookup failed";
  return (
    <div className="lyrics-song-error" id="main-content">
      <article>
        <header>
          <h1>{pageTitle}</h1>
        </header>
        <p>The song lookup unfortunately failed.</p>
        <pre>{error}</pre>
        <footer>
          <a href={PREFIX}>Go back to main blog post</a>
        </footer>
      </article>
    </div>
  );
}
