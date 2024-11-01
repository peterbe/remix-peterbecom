export interface Document {
  oid: string;
  title: string;
  date: string;
  comment_oid: string | null;
  summary: string;
  categories?: string[];

  score: number;
  score_boosted?: number;
  popularity?: number;
  popularity_ranking?: number;
}

export type SearchTerm = [number, string];

export type SearchTermBoosts = {
  [key: string]: [number, number];
};

interface SearchResult {
  count_documents: number;
  count_documents_shown: number;
  documents: Document[];
  search_time: number;
  search_terms: SearchTerm[];
  search_term_boosts: SearchTermBoosts;
}

export interface ServerData {
  results: SearchResult;
}

export interface Props {
  q: string | null;
  debug: boolean;
}
