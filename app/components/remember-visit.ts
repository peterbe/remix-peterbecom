import { useEffect, useState } from "react";

import type { Comments, Post } from "~/types";

const STORAGE_KEY = "visited-posts";

export type RememberedPost = {
  oid: string;
  comments: number;
  categories: string[];
  title: string;
  pubDate: string;
  visited: string;
};

const DELAY_SECONDS = 2;

export function useRememberVisit(post: Post, comments: Comments) {
  function remember() {
    const previous = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]",
    ) as RememberedPost[];
    let save = false;
    if (previous.length > 0 && previous[0].oid === post.oid) {
      // Update
      previous[0].comments = comments.count;
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
        comments: comments.count,
        categories: post.categories,
        title: post.title,
        pubDate: post.pub_date,
        visited: new Date().toISOString(),
      });

      save = true;
    }
    if (save) {
      console.log("SAVE....", previous);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(previous.slice(0, 20)));
    }
  }

  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (mounted) remember();
    }, DELAY_SECONDS * 1000);

    return () => {
      mounted = false;
    };
  }, [post, comments]);
}

export function useRecentVisits() {
  const [visited, setVisited] = useState<RememberedPost[]>([]);
  useEffect(() => {
    const previous = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]",
    ) as RememberedPost[];
    setVisited(previous);
  }, []);
  function clearVisited() {
    localStorage.removeItem(STORAGE_KEY);
    setVisited([]);
  }
  return { visited, clearVisited };
}
