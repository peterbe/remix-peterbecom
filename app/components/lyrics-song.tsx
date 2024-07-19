import { useSearchParams } from "@remix-run/react";
import { Fragment } from "react";

import type { LyricsSong } from "~/valibot-types";

import { useSendPageview } from "../analytics";
import { CarbonAd } from "./carbonad";

const PREFIX = "/plog/blogitem-040601-1";

type Props = {
  song: LyricsSong;
};
export function LyricsSong({ song }: Props) {
  useSendPageview();

  const pageTitle = `"${song.name}" by "${song.artist.name}"`;

  return (
    <div className="lyrics-song">
      <div style={{ float: "right" }}>
        <CarbonAd />
      </div>
      <hgroup>
        <h1>{pageTitle}</h1>
        <h2 style={{ fontSize: "1.2rem" }}>
          By <b>{song.artist.name}</b> {song.year && `(${song.year})`}
        </h2>
        <h3>
          On album{" "}
          {song.albums.map((album, i) => (
            <Fragment key={album.name + i}>
              <b>{album.name}</b> {album.year && `(${album.year})`}{" "}
            </Fragment>
          ))}
        </h3>
      </hgroup>

      <div id="main-content">
        <Back />

        {song.image && (
          <img
            src={song.image.url}
            alt={song.image.name}
            style={{ float: "right" }}
          />
        )}
        <div
          dangerouslySetInnerHTML={{ __html: song.text_html }}
          style={{ marginBottom: 50 }}
        ></div>

        <Back />

        <Credit />
      </div>
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

function Back() {
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search");
  return (
    <div style={{ padding: 20 }}>
      {search && (
        <p>
          Go back to your search{" "}
          <a
            href={PREFIX + "/search/" + encodeURIComponent(search)}
            style={{ fontStyle: "italic" }}
          >
            "{search}"
          </a>
        </p>
      )}
      <p>
        <a href={PREFIX}>Go back to main blog post</a>
      </p>
    </div>
  );
}
