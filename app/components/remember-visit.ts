import { useCallback, useEffect, useState } from "react";

import type { Post } from "~/types";

const STORAGE_KEY = "visited-posts";
const MAX_REMEMBERED = 5;

export type RememberedPost = {
  oid: string;
  categories: string[];
  title: string;
  pubDate: string;
  visited: string;
};

const DELAY_SECONDS = 2;

export function useRememberVisit(post: Post) {
  const remember = useCallback(() => {
    const previous = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]",
    ) as RememberedPost[];
    let save = false;
    if (previous.length > 0 && previous[0].oid === post.oid) {
      // Update
      previous[0].title = post.title;
      previous[0].categories = post.categories;
      previous[0].pubDate = post.pub_date;
      previous[0].visited = new Date().toISOString();
      save = true;
    } else {
      // Remove if previously there
      while (previous.find((p) => p.oid === post.oid)) {
        const index = previous.findIndex((p) => p.oid === post.oid);
        if (index > -1) {
          previous.splice(index, 1);
        }
      }

      // Add new post
      previous.unshift({
        oid: post.oid,
        categories: post.categories,
        title: post.title,
        pubDate: post.pub_date,
        visited: new Date().toISOString(),
      });

      save = true;
    }
    if (save) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(previous.slice(0, MAX_REMEMBERED)),
      );
    }
  }, [post]);

  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (mounted) remember();
    }, DELAY_SECONDS * 1000);

    return () => {
      mounted = false;
    };
  }, [post, remember]);
}

export function useRecentVisits() {
  const [visited, setVisited] = useState<RememberedPost[]>([]);
  useEffect(() => {
    const previous = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]",
    ) as RememberedPost[];
    setVisited(previous);
  }, []);
  const [undoVisisted, setUndoVisited] = useState<RememberedPost[]>([]);
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
