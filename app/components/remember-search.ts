import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "search-queries";

export type Search = {
  term: string;
  found: number;
  //   categories: string[];
  //   title: string;
  //   pubDate: string;
  //   visited: string;
};
export type RememberedSearch = Search & {
  date: string;
};

const DELAY_SECONDS = 1;

// type Search = {
//     term: string
// }

export function useRememberSearch(search: Search) {
  const remember = useCallback(() => {
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

      // Add new post
      previous.unshift({
        term: search.term,
        found: search.found,
        // categories: post.categories,
        // title: post.title,
        // pubDate: post.pub_date,
        date: new Date().toISOString(),
      });

      save = true;
    }
    if (save) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(previous.slice(0, 10)));
    }
  }, [search]);

  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (mounted) remember();
    }, DELAY_SECONDS * 1000);

    return () => {
      mounted = false;
    };
  }, [search, remember]);
}

export function useRecentSearches() {
  const [visited, setVisited] = useState<RememberedSearch[]>([]);
  useEffect(() => {
    const previous = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]",
    ) as RememberedSearch[];
    setVisited(previous);
  }, []);
  const [undoVisisted, setUndoVisited] = useState<RememberedSearch[]>([]);
  function clearVisited() {
    localStorage.removeItem(STORAGE_KEY);
    setUndoVisited(visited);
    setVisited([]);
  }

  function undoClearVisited() {
    if (undoVisisted.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(undoVisisted));
      setVisited(undoVisisted);
      setUndoVisited([]);
    }
  }
  const undoable = undoVisisted.length > 0;
  return { visited, clearVisited, undoClearVisited, undoable };
}
