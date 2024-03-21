import { useNavigate, useSearchParams } from "@remix-run/react";
import { useCombobox } from "downshift";
import { useState } from "react";

export function SearchForm() {
  const [searchParams] = useSearchParams();
  // const [query, setQuery] = useState(searchParams.get("q") || "");
  const [query] = useState(searchParams.get("q") || "");
  const navigate = useNavigate();
  return (
    <form
      action="/search"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(`/search?${new URLSearchParams({ q: query }).toString()}`);
      }}
    >
      <ComboBox />
      {/* <input
        type="search"
        name="q"
        placeholder="Search"
        aria-label="Search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      /> */}
    </form>
  );
}

type Book = {
  id: string;
  author: string;
  title: string;
};
const books: Book[] = [
  { id: "book-1", author: "Harper Lee", title: "To Kill a Mockingbird" },
  { id: "book-2", author: "Lev Tolstoy", title: "War and Peace" },
  { id: "book-3", author: "Fyodor Dostoyevsy", title: "The Idiot" },
  { id: "book-4", author: "Oscar Wilde", title: "A Picture of Dorian Gray" },
  { id: "book-5", author: "George Orwell", title: "1984" },
  { id: "book-6", author: "Jane Austen", title: "Pride and Prejudice" },
  { id: "book-7", author: "Marcus Aurelius", title: "Meditations" },
  {
    id: "book-8",
    author: "Fyodor Dostoevsky",
    title: "The Brothers Karamazov",
  },
  { id: "book-9", author: "Lev Tolstoy", title: "Anna Karenina" },
  { id: "book-10", author: "Fyodor Dostoevsky", title: "Crime and Punishment" },
];
function getBooksFilter(inputValue: string) {
  const lowerCasedInputValue = inputValue.toLowerCase();

  return function booksFilter(book: Book) {
    return (
      !inputValue ||
      book.title.toLowerCase().includes(lowerCasedInputValue) ||
      book.author.toLowerCase().includes(lowerCasedInputValue)
    );
  };
}

function ComboBox() {
  const [items, setItems] = useState(books);
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
  } = useCombobox({
    onInputValueChange({ inputValue }) {
      setItems(books.filter(getBooksFilter(inputValue)));
    },
    items,
    itemToString(item) {
      return item ? item.title : "";
    },
  });

  return (
    <div>
      <div>
        <label className="w-fit" {...getLabelProps()}>
          Search terms:
        </label>
        <fieldset role="group">
          <input
            placeholder="Search anything on this blog"
            {...getInputProps()}
          />
          <button
            aria-label="toggle menu"
            type="button"
            {...getToggleButtonProps()}
          >
            {isOpen ? <>&#8593;</> : <>&#8595;</>}
          </button>
        </fieldset>
      </div>
      <ul
        className={`absolute w-72 bg-white mt-1 shadow-md max-h-80 overflow-scroll p-0 z-10 ${
          !(isOpen && items.length) && "hidden"
        }`}
        {...getMenuProps()}
      >
        {isOpen &&
          items.map((item, index) => {
            let className = "";
            if (highlightedIndex === index) className += "highlighted ";
            if (selectedItem === item) className += "selected ";
            return (
              <li
                className={className}
                key={item.id}
                {...getItemProps({ item, index })}
              >
                <span>{item.title}</span>
                <span className="text-sm text-gray-700">{item.author}</span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
