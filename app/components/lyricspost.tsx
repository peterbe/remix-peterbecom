import type { Comments, Post } from "~/types";

import { CarbonAd } from "./carbonad";
import { PostComments } from "./comments";
import { ScrollToTop } from "./scroll-to-top";
import SongSearchAutocomplete from "./songsearch-autocomplete";

type Props = {
  post: Post;
  comments: Comments;
  page: number;
};
export function Lyricspost({ post, comments, page }: Props) {
  return (
    <div>
      <hgroup>
        <h1>{post.title}</h1>
        <SongLyricsSubheader page={page} />
      </hgroup>

      <SongSearchAutocomplete />

      <CarbonAd />

      <PostComments post={post} comments={comments} page={page} />

      <ScrollToTop />
    </div>
  );
}

function SongLyricsSubheader({ page }: { page: number }) {
  const titles: {
    [key: number]: string;
  } = {
    1: "I'm looking for a song that goes like this lyrics.",
    2: "I'm looking for this song by these lyrics.",
    3: "I'm looking for a song I don't know the name of.",
    4: "Looking for a song you heard, but don't know the name?",
    5: "Looking for a song you heard, but don't know the name?",
    6: "Trying to find a song but only know a few words.",
    7: "Anyone know this song by these lyrics?",
    8: "I'm looking for this song by these lyrics.",
    9: "Trying to find the name of the song.",
    10: "Looking for the name of the song by the lyrics.",
    11: "Help me find the name of the song by lyrics.",
    12: "I'm looking for a song that goes...",
    13: "I don't know the song, but I know some lyrics.",
  };
  const title = titles[page] || "Look for a song by its lyrics.";
  return <h3>{title}</h3>;
}
