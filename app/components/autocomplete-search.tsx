import { Link } from "@remix-run/react";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useDebounce } from "usehooks-ts";

// import { formatDateBasic, postURL } from "~/utils/utils";

function searchURL(q: string) {
  return `/search?${new URLSearchParams({ q }).toString()}`;
}

// interface Document {
//   oid: string;
//   title: string;
//   date: string;
// }

type SearchMeta = {
  found: number;
};

type TypeaheadResult = {
  term: string;
  highlights: string[];
};

type ServerData = {
  results: TypeaheadResult[];
  meta: SearchMeta;
};

type Props = {
  goTo: (url: string) => void;
};

export default function AutocompleteSearch({ goTo }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const debouncedInput = useDebounce<string>(input, 100);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const apiURL = debouncedInput.trim()
    ? `/api/v1/typeahead?${new URLSearchParams({
        q: debouncedInput.trim(),
      }).toString()}`
    : null;

  const { data, error } = useSWR<ServerData, Error>(
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
    },
  );

  const [highlight, setHighlight] = useState(-1);
  const goToCallback = useCallback((url: string) => goTo(url), [goTo]);

  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        if (data) {
          setHighlight((highlight) =>
            Math.min(data.results.length - 1, highlight + 1),
          );
          e.preventDefault();
        }
      } else if (e.key === "ArrowUp") {
        setHighlight((highlight) => Math.max(-1, highlight - 1));
        e.preventDefault();
      } else if (e.key === "Enter") {
        if (data && highlight > -1) {
          // goToCallback(postURL(data.results[highlight].oid));
          goToCallback(searchURL(data.results[highlight].term));
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [data, highlight, goToCallback]);

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (highlight === -1) {
            goTo(searchURL(input));
          } else if (data && data.results && data.results[highlight]) {
            // goTo(postURL(data.results[highlight].oid));
            goTo(searchURL(data.results[highlight].term));
          }
        }}
      >
        <input
          type="search"
          name="q"
          placeholder="Search"
          ref={inputRef}
          onChange={(event) => {
            setInput(event.target.value);
          }}
        />
      </form>

      {error && <SearchError error={error} input={input} />}
      {input.trim() && data && data.results && (
        // <Results
        //   results={data.results}
        //   meta={data.meta}
        //   highlight={highlight}
        //   goTo={goToCallback}
        // />
        <TypeaheadResults
          results={data.results}
          meta={data.meta}
          highlight={highlight}
          goTo={goToCallback}
        />
      )}
      {data && input.trim() && <FullSearchLink input={input} />}
    </div>
  );
}

function FullSearchLink({ input }: { input: string }) {
  return (
    <p style={{ margin: 20, textAlign: "center", fontStyle: "italic" }}>
      <Link to={searchURL(input)}>Full search</Link>
    </p>
  );
}

function SearchError({ error, input }: { error: Error; input: string }) {
  return (
    <div>
      <p>
        <strong>Error</strong>
      </p>
      <p style={{ color: "red" }}>{error.message}</p>
      <FullSearchLink input={input} />
    </div>
  );
}

// function Results({
//   results,
//   meta,
//   highlight,
//   goTo,
// }: {
//   results: Document[];
//   meta: SearchMeta;
//   highlight: number;
//   goTo: (url: string) => void;
// }) {
//   return (
//     <div>
//       <p style={{ textAlign: "right", fontSize: "0.8rem", marginBottom: 0 }}>
//         {meta.found.toLocaleString()} found
//       </p>
//       {results.map((doc, i) => {
//         return (
//           <p
//             key={doc.oid}
//             style={
//               i === highlight
//                 ? {
//                     backgroundColor: "var(--code-background-color)",
//                     padding: 5,
//                     marginBottom: 10,
//                   }
//                 : { padding: 5, marginBottom: 10 }
//             }
//           >
//             <Link
//               to={postURL(doc.oid)}
//               onClick={() => {
//                 goTo(postURL(doc.oid));
//               }}
//               dangerouslySetInnerHTML={{ __html: doc.title }}
//             ></Link>{" "}
//             <small>{formatDateBasic(doc.date)}</small>
//           </p>
//         );
//       })}
//     </div>
//   );
// }

function TypeaheadResults({
  results,
  meta,
  highlight,
  goTo,
}: {
  results: TypeaheadResult[];
  meta: SearchMeta;
  highlight: number;
  goTo: (url: string) => void;
}) {
  return (
    <div>
      <p style={{ textAlign: "right", fontSize: "0.8rem", marginBottom: 0 }}>
        {meta.found.toLocaleString()} found
      </p>
      {results.map((doc, i) => {
        return (
          <p
            key={doc.term}
            style={
              i === highlight
                ? {
                    backgroundColor: "var(--code-background-color)",
                    padding: 5,
                    marginBottom: 10,
                  }
                : { padding: 5, marginBottom: 10 }
            }
          >
            <Link
              to={searchURL(doc.term)}
              onClick={() => {
                goTo(searchURL(doc.term));
              }}
              dangerouslySetInnerHTML={{
                __html: doc.highlights.length ? doc.highlights[0] : doc.term,
              }}
            ></Link>
          </p>
        );
      })}
    </div>
  );
}
