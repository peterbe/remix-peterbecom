import { useState } from "react";

import { useSendPageview } from "~/analytics";

import { sideProjects } from "./about-sideprojects";
import { Nav } from "./nav";

export function About() {
  useSendPageview();
  const [qInput, setQInput] = useState("");

  const sideProjectsFiltered = sideProjects.filter((project) => {
    return (
      !qInput.trim() ||
      project.title.toLowerCase().includes(qInput.trim().toLowerCase())
    );
  });

  return (
    <div className="about">
      <Nav title={"About Peterbe.com"} />
      <div id="main-content">
        <p>
          My name is <strong>Peter Bengtsson</strong> and I&apos;m a web
          developer. This is my personal blog.
        </p>
        <ul>
          <li>Born and raised in Sweden for two decades</li>
          <li>Studied and lived in London, England for one decade</li>
          <li>Moved to Californa, then South Carolina for the last decade</li>
        </ul>
        <p>
          I work at <a href="https://github.com">GitHub</a> on the{" "}
          <b>React Platform</b> team. Prior to that, to that{" "}
          <a href="https://www.mozilla.org">Mozilla</a> and{" "}
          <a href="https://developer.mozilla.org">MDN Web Docs</a>.
        </p>
        <p>
          The{" "}
          <a href="https://podcasts.apple.com/us/podcast/the-mycelium-network-podcast/id1639357086">
            The Mycelium Network Podcast
          </a>{" "}
          did an interview with me in August 2022. Link to episode on{" "}
          <a href="https://podcasts.apple.com/us/podcast/the-mycelium-network-podcast-with-peter-bengtsson/id1639357086?i=1000577933476">
            Apple
          </a>{" "}
          and{" "}
          <a href="https://open.spotify.com/episode/2vw6EShZOFdgLBEQPHFsAx?si=637a3ac26b074fe5">
            Spotify
          </a>
          .
        </p>
        <p>
          Almost all of my work is Open Source and available on{" "}
          <a href="https://github.com/peterbe">my GitHub account</a> including
          this site itself:{" "}
          <a href="https://github.com/peterbe/remix-peterbecom">front-end</a>,{" "}
          <a href="https://github.com/peterbe/django-peterbecom">back-end</a>.
        </p>
      </div>

      <h2>Side projects</h2>

      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <input
          type="search"
          name="q"
          placeholder="Filter by title"
          value={qInput}
          onChange={(event) => setQInput(event.target.value)}
        />
      </form>

      <div className="side-projects">
        {sideProjectsFiltered.length === 0 && (
          <p>
            <i>Nothing found</i>{" "}
            <a
              href="/about"
              role="button"
              onClick={(event) => {
                event.preventDefault();
                setQInput("");
              }}
            >
              Reset
            </a>
          </p>
        )}
        {sideProjectsFiltered.map((project, i) => {
          return (
            <article key={project.id} id={project.id}>
              <div className="grid">
                <div>
                  <hgroup>
                    <h3>
                      <a href={`#${project.id}`}>{project.title}</a>
                    </h3>
                    <h4>
                      <a href={project.url}>{project.url}</a>
                    </h4>
                  </hgroup>
                </div>
                <div className="screenshot">
                  <a href={project.url} title={project.title}>
                    <picture>
                      {project.image.url.endsWith(".png") && (
                        <source
                          srcSet={project.image.url.replace(/\.png$/, ".webp")}
                          type="image/webp"
                        />
                      )}
                      <img
                        src={project.image.url}
                        alt={project.title}
                        width={project.image.width}
                        height={project.image.height}
                        loading={i > 3 ? "lazy" : undefined}
                      />
                    </picture>
                  </a>
                </div>
              </div>

              {project.body}
            </article>
          );
        })}
      </div>
    </div>
  );
}
