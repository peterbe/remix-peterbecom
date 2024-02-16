import { useNavigate, useSearchParams } from "@remix-run/react";
import { useState } from "react";

export function SearchForm() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const navigate = useNavigate();
  return (
    <form
      action="/search"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(`/search?${new URLSearchParams({ q: query }).toString()}`);
      }}
    >
      <input
        type="search"
        name="q"
        placeholder="Search"
        aria-label="Search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </form>
  );
}
