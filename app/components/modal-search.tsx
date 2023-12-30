import { lazy, Suspense, useEffect } from "react";

const AutocompleteSearch = lazy(
  // @ts-ignore
  () => import("~/components/autocomplete-search"),
);

type Props = {
  onClose: (url?: string) => void;
};

export function ModalSearch({ onClose }: Props) {
  useEffect(() => {
    const close = (e: { key: string }) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  return (
    <dialog open>
      <article>
        <header>
          <a
            href="/"
            aria-label="Close"
            className="close"
            onClick={(event) => {
              event.preventDefault();
              onClose();
            }}
          >
            {" "}
          </a>
          Search
        </header>
        <Suspense fallback={<div>Loading...</div>}>
          <AutocompleteSearch
            goTo={(url) => {
              onClose(url);
            }}
          />
        </Suspense>
      </article>
    </dialog>
  );
}
