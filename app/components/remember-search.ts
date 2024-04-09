import { useState } from "react";

const STORAGE_KEY = "search-queries";
const MAX_REMEMBERED = 5;

export type Search = {
  term: string;
  found: number;
};
export type RememberedSearch = Search & {
  date: string;
};

const IS_SERVER = typeof window === "undefined";

export function useRememberSearch() {
  let previous: RememberedSearch[] = [];
  if (!IS_SERVER) {
    try {
      previous.push(...JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch (error) {
      console.warn("Failed to get recent searches from local storage", error);
    }
  }
  const [searches, setSearches] = useState<RememberedSearch[]>(previous);

  function rememberSearch(search: Search) {
    const previous = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]",
    ) as RememberedSearch[];
    let save = false;
    if (previous.length > 0 && previous[0].term === search.term) {
      // Update, maybe
      if (previous[0].found !== search.found) {
        previous[0].found = search.found;
        save = true;
      }
    } else {
      // Remove if previously there
      while (previous.find((p) => p.term === search.term)) {
        const index = previous.findIndex((p) => p.term === search.term);
        if (index > -1) {
          previous.splice(index, 1);
        }
      }

      // Add new entry
      previous.unshift({
        term: search.term,
        found: search.found,
        date: new Date().toISOString(),
      });

      save = true;
    }

    if (save) {
      setSearches(previous.slice(0, MAX_REMEMBERED));
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(previous.slice(0, MAX_REMEMBERED)),
      );
    }
  }

  function clearSearches() {
    setSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return { rememberSearch, searches, clearSearches };
}
