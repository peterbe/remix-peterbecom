import { useSendPageview } from "~/analytics";

import { Nav } from "./nav";

export function Contact() {
  useSendPageview();
  return (
    <div className="contact">
      <Nav title={"Contact Peter"} />

      <div id="main-content">
        <h3>Email</h3>
        <p>
          <a href="mailto:mail@peterbe.com">mail@peterbe.com</a>
        </p>

        <h3>GitHub</h3>
        <p>
          <a href="https://github.com/peterbe">@peterbe</a>
        </p>

        <h3>Threads</h3>
        <p>
          <a href="https://www.threads.net/@peppebe">@peppebe</a>
        </p>

        <h3>Telegram</h3>
        <p>@peppebe</p>

        <h3>LinkedIn</h3>
        <p>
          <a href="https://www.linkedin.com/in/peterbe/">@peterbe</a>
        </p>

        <h3>Instagram</h3>
        <p>
          <a href="https://www.instagram.com/peppebe/">@peppebe</a> (
          <em>inactive</em>)
        </p>

        <h3>Twitter</h3>
        <p>
          <a href="https://twitter.com/peterbe">@peterbe</a> (<em>inactive</em>)
        </p>
      </div>
    </div>
  );
}
