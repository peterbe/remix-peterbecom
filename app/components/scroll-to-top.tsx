export function ScrollToTop() {
  return (
    <p className="scroll-to-top">
      <a
        href="#top"
        role="button"
        className="outline"
        onClick={(event) => {
          event.preventDefault();
          window.scrollTo(0, 0);
        }}
      >
        Go to top of the page
      </a>
    </p>
  );
}
