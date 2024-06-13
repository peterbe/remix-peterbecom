export function SkipToNav() {
  function handler(event: React.MouseEvent<HTMLAnchorElement>) {
    const id = event.currentTarget.href.split("#")[1];
    if (id) {
      const element = document.getElementById(id);
      if (element) {
        event.preventDefault();
        element.scrollIntoView();
        element.focus();
      }
    }
  }
  return (
    <ul className="skip-to-nav">
      <li>
        <a href="#main-nav" onClick={handler}>
          Skip to main navigation
        </a>
      </li>
      <li>
        <a href="#main-content" onClick={handler}>
          Skip to main content
        </a>
      </li>
      <li>
        <a href="#main-search" onClick={handler}>
          Skip to search
        </a>
      </li>
    </ul>
  );
}
