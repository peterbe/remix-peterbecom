import { useNavigate, useSearchParams } from "@remix-run/react";
import { useCombobox } from "downshift";
import { useState } from "react";
import useSWR from "swr";
import { useDebounceValue } from "usehooks-ts";

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

export function SearchForm() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [query] = useState(searchParams.get("q") || "");

  const [input, setInput] = useState(query);

  const debouncedInput = useDebounceValue<string>(input, 100);

  const apiURL = debouncedInput[0].trim()
    ? `/api/v1/typeahead?${new URLSearchParams({
        q: debouncedInput[0].trim(),
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

  const items = (input.trim() && data?.results) || [];
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
    // getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    // selectedItem,
  } = useCombobox({
    onInputValueChange({ inputValue }) {
      setInput(inputValue);
    },
    items,
    itemToString(item) {
      return item ? item.term : "";
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        navigate(
          `/search?${new URLSearchParams({ q: selectedItem.term }).toString()}`,
        );
      }
    },
    initialInputValue: query,
  });

  return (
    <form
      className="downshift-wrapper"
      action="/search"
      onSubmit={(event) => {
        event.preventDefault();
        if (input.trim()) {
          navigate(
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
          {/* <button
            aria-label="toggle menu"
            type="button"
            {...getToggleButtonProps()}
          >
            {isOpen ? <>&#8593;</> : <>&#8595;</>}
          </button> */}
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
          {/* {isOpen && input.trim() && (
            <li
              className="downshift-faux"
              key={input}
              {...getItemProps({
                item: { term: input, highlights: [input], faux: true },
                index: items.length,
              })}
            >
              Search for <i>{input}</i>
            </li>
          )} */}
        </ul>
      </article>
    </form>
  );
}
