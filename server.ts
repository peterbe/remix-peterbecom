import shrinkRay from "@nitedani/shrink-ray-current";
import { createProxyMiddleware } from "http-proxy-middleware";
import { dynamicImages } from "./server/dynamic-images.js";
import { legacyRedirects } from "./server/legacy-redirects.js";
import { junkBlock } from "./server/junk-block.js";
import { ip } from "./server/ip.js";
import compression from "compression";

import asyncHandler from "express-async-handler";
import path from "path";
import express from "express";
import morgan from "morgan";
import { createRequestHandler } from "@remix-run/express";
import dotenv from "dotenv";

dotenv.config();

const BACKEND_BASE_URL = process.env.API_BASE || "http://127.0.0.1:8000";
const BUILD_DIR = path.resolve("build");
const USE_COMPRESSION = Boolean(
  JSON.parse(process.env.USE_COMPRESSION || "false"),
);

export const app = express();

if (USE_COMPRESSION) {
  app.use(compression());
}

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" }),
);

// Move to belong the express.static(...) uses if you don't want to see
// log lines for static assets.
// app.use(morgan("tiny"));
// app.use(morgan("dev"));
// app.use(morgan("common"));
app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? ":method :url [:date[iso]] :status :res[content-length] - :response-time ms [:user-agent]"
      : "tiny",
  ),
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1d" }));

app.use(asyncHandler(dynamicImages));

app.use(shrinkRay());

const backendProxy = createProxyMiddleware({
  target: BACKEND_BASE_URL,
  changeOrigin: true,
  pathRewrite: function (path, req) {
    return (req as any).originalUrl as string;
  },
});
app.use("*/rss.xml", backendProxy);
app.use("/robots.txt", backendProxy);
app.use("/sitemap.xml", backendProxy);
app.use("/avatar.random.png", backendProxy);
app.use("/avatar.png", backendProxy);
app.use("/__huey__", backendProxy);
// If the server is localhost:3000 and the backend is https://www.peterbe.com
// it might be a problem with cookies because that server will have `Secure`
// in the `Set-Cookie` which won't be acceptable on http://localhost:3000
app.use("/api/", backendProxy);
app.use("/cache/", backendProxy);
app.use("*/ping", backendProxy); // Legacy. Delete later in 2024

app.use(legacyRedirects);
app.use(junkBlock);
app.use("/_ip", ip);
app.post(
  "/events",
  createProxyMiddleware({
    target: BACKEND_BASE_URL,
    changeOrigin: true,
    pathRewrite: () => "/api/v1/events",
  }),
);
app.post("*", (req, res) => res.sendStatus(405));

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
      }),
);
const port = process.env.PORT || 3000;

export async function main() {
  return app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
  });
}

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
