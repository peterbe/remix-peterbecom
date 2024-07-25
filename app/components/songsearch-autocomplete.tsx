import { useSearchParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { debounce, throttle } from "throttle-debounce";

import { sendEvent as _sendEvent } from "../analytics";

type SendEventData = {
  type: "autocomplete" | "submit" | "select" | "enter";
  q?: string;
  gotoURL?: string;
};

let lastAutocompleteQ = "";
function sendEvent(d: SendEventData) {
  if (d.type && d.type === "autocomplete") {
    if (lastAutocompleteQ && d.q && d.q.startsWith(lastAutocompleteQ)) {
      return;
    }
    lastAutocompleteQ = d.q || "";
  }
  _sendEvent("songsearch-autocomplete", d);
}

interface Suggestion {
  id: number;
  _url: string;
  name: string;
  image: null | {
    url: string;
    thumbnail100: string;
  };
  artist: {
    name: string;
  };
  fragments: string[];
}

interface ServerData {
  matches: Suggestion[];
  search_suggestions: {
    term: string;
    desperate: boolean;
    total: number;
    capped: boolean;
  };
  more_to_be_found: number | null;
}

const SERVER = "https://songsear.ch";
const MAX_LENGTH = 150;

declare global {
  interface Window {
    Image: {
      prototype: HTMLImageElement;
      new (): HTMLImageElement;
    };
  }
}

function absolutifyUrl(uri: string, server = SERVER) {
  if (uri.charAt(0) === "/" && uri.charAt(1) !== "/") {
    return server + uri;
  }
  return uri;
}

const placeholderImage = "/songsearch-autocomplete-static/placeholder.png";
const lazyloadThumbnailImage =
  "/songsearch-autocomplete-static/lazyload-thumbnail.png";

let preloadedImages = false;
function preloadImages() {
  if (!preloadedImages) {
    preloadedImages = true;
    new window.Image().src = lazyloadThumbnailImage;
    new window.Image().src = placeholderImage;
  }
}

const fetchAutocompleteSuggestionsCache = new Map<string, Suggestion[]>();

export default function SongSearchAutocomplete() {
  const [q, setQ] = useState("");
  const [waitingFor, setWaitingFor] = useState("");
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<
    Suggestion[] | null
  >(null);
  const [autocompleteHighlight, setAutocompleteHighlight] = useState(-1);
  const [showAutocompleteSuggestions, setShowAutocompleteSuggestions] =
    useState(false);
  const [redirectingSearch, setRedirectingSearch] = useState("");
  const [searchMaxLength, setSearchMaxLength] = useState<number | null>(null);

  const [server, setServer] = useState(SERVER);
  useEffect(() => {
    fetch("/api/v1/lyrics/featureflag").then((r) => {
      if (r.ok) {
        r.json().then((data) => {
          _sendEvent("lyrics-featureflag", { enabled: `${!!data.enabled}` });
          if (data.enabled) {
            setServer("/plog/blogitem-040601-1");
          }
        });
      } else {
        _sendEvent("lyrics-featureflag", { response_not_ok: "true" });
      }
    });
  }, []);

  // Temporary
  const [searchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get("server") === "local") {
      setServer("/plog/blogitem-040601-1");
    } else if (searchParams.get("server")) {
      console.error(
        `Don't know what to do with: ${searchParams.get("server")}`,
      );
    }
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    if (redirectingSearch) {
      setTimeout(() => {
        if (mounted) setRedirectingSearch("");
      }, 3000);
    }
    return () => {
      mounted = false;
    };
  }, [redirectingSearch]);

  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    if (!q.trim()) return;
    if (q.trim().length < 3) {
      return;
    }

    const gotoURL =
      server === SERVER
        ? `${SERVER}/q/${encodeURIComponent(q)}`
        : `${server}/q/${encodeURIComponent(q)}`;

    setRedirectingSearch(gotoURL);
    setAutocompleteSuggestions(null);
    setAutocompleteHighlight(-1);
    setShowAutocompleteSuggestions(true);

    sendEvent({ type: "submit", q });

    document.location.href = gotoURL;
  }

  function onSelectSuggestion(song: Suggestion) {
    let gotoURL = `${server}${song._url}`;
    if (server !== SERVER && q.trim()) {
      gotoURL += `?${new URLSearchParams({ search: q.trim() })}`;
    }

    setRedirectingSearch(gotoURL);
    setAutocompleteSuggestions(null);
    setAutocompleteHighlight(-1);

    sendEvent({ type: "select", gotoURL, q });

    document.location.href = gotoURL;
  }

  const [firstFocusSearch, setFirstFocusSearch] = useState(false);
  useEffect(() => {
    if (firstFocusSearch) {
      // If you're on a small screen this is the first time you've focused,
      // the scroll the top of the search input into view.
      if (window.innerHeight && window.innerHeight < 600) {
        if (inputRef.current) inputRef.current.scrollIntoView();
      }
    }
  }, [firstFocusSearch]);

  function onFocusSearch() {
    preloadImages(); // this is memoized to only happen once

    if (!showAutocompleteSuggestions) {
      setShowAutocompleteSuggestions(true);
      setRedirectingSearch("");
    }
    if (!firstFocusSearch) {
      setFirstFocusSearch(true);
    }
  }

  function onBlurSearch() {
    setTimeout(() => {
      setShowAutocompleteSuggestions(false);
    }, 300);
  }

  useEffect(() => {
    const length = q.length;
    if (length > MAX_LENGTH - 10) {
      setSearchMaxLength(length);
      setShowAutocompleteSuggestions(false);
    } else if (searchMaxLength) {
      setSearchMaxLength(null);
      setShowAutocompleteSuggestions(true);
    }

    if (q.trim()) {
      if (waitingFor) {
        if (q.trim() === waitingFor.trim()) {
          // Don't bother, only whitespace has changed.
          return;
        }
      }
      if ((length < 4 || q.endsWith(" ")) && length < 24) {
        // The impatient one.
        fetchAutocompleteSuggestionsThrottled();
      } else if (length > 24) {
        // The patient one.
        fetchAutocompleteSuggestionsDebouncedLong();
      } else if (length) {
        // The patient one.
        fetchAutocompleteSuggestionsDebounced();
      } else {
        setAutocompleteSuggestions(null);
        // autocompleteSearchSuggestions: null,
        setAutocompleteHighlight(-1);
        setShowAutocompleteSuggestions(true);
        setRedirectingSearch("");
      }
    } else {
      setAutocompleteSuggestions(null);
      setAutocompleteHighlight(-1);
      setRedirectingSearch("");
      setShowAutocompleteSuggestions(true);
    }
  }, [q]);

  const fetchAutocompleteSuggestionsDebounced = debounce(
    800,
    fetchAutocompleteSuggestions,
  );
  const fetchAutocompleteSuggestionsDebouncedLong = debounce(
    1800,
    fetchAutocompleteSuggestions,
  );
  const fetchAutocompleteSuggestionsThrottled = throttle(
    1100,
    fetchAutocompleteSuggestions,
  );

  function fetchAutocompleteSuggestions() {
    let url = `${SERVER}/api/search/autocomplete?q=${encodeURIComponent(q)}`;
    const cached = fetchAutocompleteSuggestionsCache.get(q.trim());
    if (cached) {
      return Promise.resolve(cached).then((results) => {
        setAutocompleteSuggestions(results);
        setAutocompleteHighlight(-1);
      });
    }
    setWaitingFor(q);
    fetch(url)
      .then((r) => {
        if (r.status === 200) {
          if (q.startsWith(waitingFor)) {
            r.json().then((results: ServerData) => {
              const songsOnly = results.matches.filter((i) => !!i.id);
              fetchAutocompleteSuggestionsCache.set(q.trim(), songsOnly);
              setAutocompleteSuggestions(songsOnly);
              setAutocompleteHighlight(-1);
            });
          }
        }
      })
      .catch((ex) => {
        console.warn(`Catch fetching ${url} ('${q}'): ${ex.toString()}`);
      });

    sendEvent({ type: "autocomplete", q });
  }

  function onKeyDownSearch(key: string): boolean {
    if (autocompleteSuggestions) {
      let highlight = autocompleteHighlight;
      if (
        (key === "ArrowDown" || key === "Tab") &&
        highlight < autocompleteSuggestions.length
      ) {
        setAutocompleteHighlight(highlight + 1);
        return true;
      } else if (key === "ArrowUp" && highlight > -1) {
        setAutocompleteHighlight(highlight - 1);
      } else if (key === "Enter") {
        if (highlight > -1) {
          highlight--;
          let gotoURL = autocompleteSuggestions[highlight]._url;

          if (gotoURL) {
            if (server !== SERVER && q.trim()) {
              gotoURL += `?${new URLSearchParams({ search: q.trim() })}`;
            }

            setRedirectingSearch(gotoURL);
            setAutocompleteSuggestions(null);
            setAutocompleteHighlight(-1);

            sendEvent({ type: "enter", gotoURL, q });

            document.location.href = absolutifyUrl(gotoURL, server);
          }
          return true;
        }
      }
    }
    return false;
  }

  return (
    <form
      className="songsearch-form"
      action="https://songsear.ch/q/"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div>
        <input
          // Don't use 'search' or the input will be rounded
          type="search"
          name="term"
          //   className="form-control x-large"
          placeholder="Type your lyrics search here..."
          maxLength={MAX_LENGTH}
          aria-label="Lyrics search"
          value={q}
          ref={inputRef}
          onChange={(e) => setQ(e.target.value)}
          onFocus={onFocusSearch}
          onBlur={onBlurSearch}
          onKeyDown={(e) => {
            if (onKeyDownSearch(e.key)) {
              e.preventDefault();
            }
          }}
        />
        <button type="submit">Search</button>
        {autocompleteSuggestions &&
          autocompleteSuggestions.length > 0 &&
          showAutocompleteSuggestions && (
            <ShowAutocompleteSuggestions
              q={q}
              onSelectSuggestion={onSelectSuggestion}
              highlight={autocompleteHighlight}
              suggestions={autocompleteSuggestions}
            />
          )}
        {searchMaxLength && searchMaxLength > 0 && (
          <ShowMaxlengthWarning
            length={searchMaxLength}
            maxLength={MAX_LENGTH}
          />
        )}
      </div>
      {redirectingSearch && server === SERVER && (
        <p>
          Sending search to <a href={redirectingSearch}>SongSearch</a> now...
        </p>
      )}
      {redirectingSearch && server !== SERVER && (
        <p>Redirecting to search now...</p>
      )}
    </form>
  );
}

function ShowMaxlengthWarning({
  length,
  maxLength,
}: {
  length: number;
  maxLength: number;
}) {
  let className = "help-block maxlength";
  if (length === maxLength) {
    className += " danger";
  }
  return (
    <p className={className}>
      {length} of max {maxLength} characters!
    </p>
  );
}

function ShowAutocompleteSuggestions({
  q,
  highlight,
  suggestions,
  // searchSuggestions,
  onSelectSuggestion,
}: // onSelectSuggestionAll,
{
  q: string;
  highlight: number;
  suggestions: Suggestion[];
  // searchSuggestions,
  onSelectSuggestion: (song: Suggestion) => void;
  // onSelectSuggestionAll;
}) {
  return (
    <div className="autocomplete">
      <ul>
        {suggestions.map((s, index) => {
          let className = index + 1 === highlight ? "active" : null;
          return (
            <li
              key={s.id}
              className={className ? className : undefined}
              onClick={() => onSelectSuggestion(s)}
            >
              <ShowAutocompleteSuggestionSong song={s} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// XXX this used to be React.memo() wrapped
function ShowAutocompleteSuggestionSong({ song }: { song: Suggestion }) {
  let imageUrl = placeholderImage;
  if (song.image) {
    if (song.image.thumbnail100) {
      imageUrl = absolutifyUrl(song.image.thumbnail100);
    } else if (song.image.url) {
      imageUrl = absolutifyUrl(song.image.url);
    }
  }
  return (
    <div className="media autocomplete-suggestion-song">
      <div className="media-left">
        <SongImage url={imageUrl} name={song.name} />
      </div>
      <div className="media-body">
        <p className="artist-name">
          <b>{song.name}</b>
          <span className="by">{" by "}</span>
          <span>{song.artist.name}</span>
        </p>
        {song.fragments.map((fragment, i) => {
          return <p key={i} dangerouslySetInnerHTML={{ __html: fragment }} />;
        })}
      </div>
    </div>
  );
}

const loadedOnce = new Set();

function SongImage({ url, name }: { url: string; name: string }) {
  const [loaded, setLoaded] = useState(loadedOnce.has(url));

  useEffect(() => {
    let mounted = true;
    const preloadImg = new window.Image();
    if (!url) {
      return;
    }
    function callback() {
      loadedOnce.add(url);
      if (mounted) setLoaded(true);
    }
    function callbackError() {
      // console.log("CALLBACK ERROR ON", url, name);
      // TODO: perhaps set something like setLoaded(new Error('failed'))
      // and based on that display a different image.
    }

    preloadImg.src = url;
    // https://html.spec.whatwg.org/multipage/embedded-content.html#dom-img-decode
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode#Browser_compatibility
    if (preloadImg.decode) {
      preloadImg.decode().then(callback, callbackError);
    } else {
      preloadImg.onload = callback;
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decoding
    // XXX Why 'sync' and not 'async'??
    preloadImg.decoding = "sync";

    return () => {
      mounted = false;
      // See https://jsfiddle.net/nw34gLgt/ for demo of this technique.
      // Immediately undo the preloading since we might not need this image.
      preloadImg.src = "";
    };
  }, []);

  return (
    <img
      className="img-rounded"
      src={!url ? placeholderImage : loaded ? url : lazyloadThumbnailImage}
      alt={name}
      title={name}
    />
  );
}
