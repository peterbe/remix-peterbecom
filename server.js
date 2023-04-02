const path = require("path");
const express = require("express");
const morgan = require("morgan");
const shrinkRay = require("shrink-ray-current");
const { createRequestHandler } = require("@remix-run/express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { dynamicImages } = require("./server/dynamic-images.js");
const { legacyRedirects } = require("./server/legacy-redirects");

const BACKEND_BASE_URL = process.env.API_BASE || "http://127.0.0.1:8000";
const BUILD_DIR = path.resolve("build");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const app = express();

// app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Move to belong the express.static(...) uses if you don't want to see
// log lines for static assets.
app.use(morgan("tiny"));

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1d" }));

app.use(asyncHandler(dynamicImages));

app.use(shrinkRay());

const backendProxy = createProxyMiddleware({
  target: BACKEND_BASE_URL,
  changeOrigin: true,
});
app.use("*/rss.xml", backendProxy);
app.use("/robots.txt", backendProxy);
app.use("/sitemap.xml", backendProxy);
app.use("/avatar.random.png", backendProxy);
app.use("/avatar.png", backendProxy);
// If the server is localhost:3000 and the backend is https://www.peterbe.com
// it might be a problem with cookies because that server will have `Secure`
// in the `Set-Cookie` which won't be acceptable on http://localhost:3000
app.use("/api/", backendProxy);
app.use("/cache/", backendProxy);
app.use("*/ping", backendProxy);

app.use(legacyRedirects);

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? (req, res, next) => {
        purgeRequireCache();

        return createRequestHandler({
          build: require(BUILD_DIR),
          mode: process.env.NODE_ENV,
        })(req, res, next);
      }
    : createRequestHandler({
        build: require(BUILD_DIR),
        mode: process.env.NODE_ENV,
      })
);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, but then you'll have to reconnect to databases/etc on each
  // change. We prefer the DX of this, so we've included it for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}
