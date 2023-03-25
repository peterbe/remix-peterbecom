import { Nav } from "./nav";

export function Contact() {
  return (
    <div className="contact">
      <Nav title={"Contact Peter"} />

      <h3>Email</h3>
      <p>
        <a href="mailto:mail@peterbe.com">mail@peterbe.com</a>
      </p>

      <h3>GitHub</h3>
      <p>
        <a href="https://github.com/peterbe">@peterbe</a>
      </p>

      <h3>Twitter</h3>
      <p>
        <a href="https://twitter.com/peterbe">@peterbe</a>
      </p>

      <h3>Instagram</h3>
      <p>
        <a href="https://www.instagram.com/peppebe/">@peppebe</a>
      </p>

      <h3>Telegram</h3>
      <p>@peppebe</p>
    </div>
  );
}
