import { useSearchParams } from "@remix-run/react";
import { useCombobox } from "downshift";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useDebounceValue, useMediaQuery } from "usehooks-ts";

import { type RememberedSearch } from "./remember-search";

type SearchMeta = {
  found: number;
};

type TypeaheadResult = {
  term: string;
  highlights: string[];
  faux?: true;
};

type ServerData = {
  results: TypeaheadResult[];
  meta: SearchMeta;
};

type Props = {
  goTo: (url: string) => void;
  autofocus?: boolean;
  recentSearches: RememberedSearch[];
};

export function SearchForm({ goTo, autofocus, recentSearches }: Props) {
  useEffect(() => {
    if (autofocus) {
      // Using a useRef didn't work. Perhaps the downshift library
      // props overrides it.
      const input = document.querySelector<HTMLInputElement>(
        '.downshift-wrapper input[type="search"]',
      );
      if (input) {
        input.focus();
      }
    }
  }, [autofocus]);

  const [searchParams] = useSearchParams();
  const [query] = useState(searchParams.get("q") || "");

  const [input, setInput] = useState(query);

  const isLarge = useMediaQuery("(min-width: 768px)");

  const debouncedInput = useDebounceValue<string>(input, 100);

  const apiURL = debouncedInput[0].trim()
    ? `/api/v1/typeahead?${new URLSearchParams({
        q: debouncedInput[0].trim(),
        n: isLarge ? "9" : "6",
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
  const debouncedError = useDebounceValue<Error | undefined>(error, 500);

  const items: TypeaheadResult[] = [];
  if (input.trim()) {
    items.push(...recentSearchesToTypeaheadResults(input, recentSearches));
  }
  if (input.trim() && data?.results) {
    items.push(
      ...data.results.filter(
        (result) => !items.find((item) => item.term === result.term),
      ),
    );
  }

  const hasSearchResults = items.length > 0;
  if (
    input.trim() &&
    input.trim().length > 2 &&
    !items.find((item) => item.faux) &&
    input !== query
  ) {
    items.push({
      term: input,
      highlights: [input],
      faux: true,
    });
  }

  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    onIsOpenChange: ({ type, isOpen, selectedItem, inputValue }) => {
      // This happens when the user ignores any suggestions and simply
      // pressed Enter after having typed something.
      // Essentially this is as if the user had entirely ignored that
      // there were any suggestions and just typed and Enter.
      if (
        type === useCombobox.stateChangeTypes.InputKeyDownEnter &&
        !isOpen &&
        !selectedItem &&
        inputValue
      ) {
        goTo(`/search?${new URLSearchParams({ q: inputValue }).toString()}`);
      }
    },
    onInputValueChange({ inputValue }) {
      setInput(inputValue);
    },
    inputValue: input,
    initialInputValue: query,
    items,
    itemToString(item) {
      return item ? item.term : "";
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        goTo(
          `/search?${new URLSearchParams({ q: selectedItem.term }).toString()}`,
        );
      }
    },
  });

  return (
    <form
      className="downshift-wrapper"
      action="/search"
      onSubmit={(event) => {
        event.preventDefault();
        if (input.trim()) {
          goTo(
            `/search?${new URLSearchParams({ q: input.trim() }).toString()}`,
          );
        }
      }}
    >
      <div>
        <label className="visually-hidden" {...getLabelProps()}>
          Search terms:
        </label>
        <fieldset role="search">
          <input
            placeholder="Search anything on this blog"
            type="search"
            {...getInputProps()}
          />
          <input type="submit" value="Search" />
        </fieldset>
        {debouncedError[0] && (
          <small>Autocomplete encountered an error 😥</small>
        )}
      </div>
      <article
        className={`downshift-dropdown ${!(isOpen && hasSearchResults) && "visually-hidden"}`}
      >
        <ul {...getMenuProps()}>
          {isOpen &&
            items.map((item, index) => {
              let className = "";
              if (highlightedIndex === index)
                className += "downshift-highlighted ";

              if (item.faux) {
                className += "downshift-faux";
                return (
                  <li
                    className={className}
                    key={item.term}
                    {...getItemProps({ item, index })}
                  >
                    <i>
                      Search for <code>{item.term}</code>
                    </i>
                  </li>
                );
              }
              return (
                <li
                  className={className}
                  key={`${item.term}${item.faux}`}
                  {...getItemProps({ item, index })}
                >
                  {item.highlights.map((highlight, i) => {
                    return (
                      <span
                        key={i}
                        dangerouslySetInnerHTML={{ __html: highlight }}
                      ></span>
                    );
                  })}
                </li>
              );
            })}
        </ul>
      </article>
    </form>
  );
}

function escapeRegex(value: string) {
  return value.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
}

function recentSearchesToTypeaheadResults(
  input: string,
  recentSearches: RememberedSearch[],
) {
  const results: TypeaheadResult[] = [];
  const rex = new RegExp(`\\b(${escapeRegex(input)})`, "gi");
  for (const recentSearch of recentSearches) {
    if (rex.test(recentSearch.term)) {
      results.push({
        term: recentSearch.term,
        highlights: [recentSearch.term.replace(rex, "<mark>$1</mark>")],
      });
    }
  }

  return results;
}
