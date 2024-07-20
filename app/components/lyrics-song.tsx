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

  const pageTitle = `${song.name}`;

  return (
    <div className="lyrics-song" id="main-content">
      <div className="head-grid-container">
        <div>
          <hgroup>
            <h1>{pageTitle}</h1>
            <h2 style={{ fontSize: "1.2rem" }}>
              By <b>{song.artist.name}</b> {song.year && `(${song.year})`}
              <br />
              On album{" "}
              {song.albums.map((album, i, arr) => (
                <Fragment key={album.name + i}>
                  <b>{album.name}</b> {album.year && `(${album.year})`}
                  {i === arr.length - 1 ? " " : ", "}
                </Fragment>
              ))}
            </h2>
            <Back />
          </hgroup>
        </div>
        <div>
          <CarbonAd />
        </div>
      </div>

      <div>
        {song.image && (
          <img
            src={song.image.url}
            alt={song.image.name}
            className="song-text-image"
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
