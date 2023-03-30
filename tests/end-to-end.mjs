import { test } from "uvu";
import * as assert from "uvu/assert";
import cheerio from "cheerio";
import got from "got";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function get(uri, followRedirect = false, throwHttpErrors = false) {
  return got(BASE_URL + uri, { followRedirect, throwHttpErrors });
}

function isCached(res) {
  const cc = res.headers["cache-control"];
  if (!cc) return false;
  const maxAge = parseInt(cc.match(/max-age=(\d+)/)[1], 10);
  return maxAge > 0 && /public/.test(cc);
}

test("home page", async () => {
  const response = await get("/");
  assert.is(response.statusCode, 200);
  assert.ok(isCached(response));
  assert.is(response.headers["content-encoding"], "br");
});

test("home page favicons", async () => {
  const response = await get("/");
  assert.is(response.statusCode, 200);
  const $ = cheerio.load(response.body);
  const favicon = $('link[rel="icon"]');
  // Based on https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
  assert.is(favicon.attr("href"), "/favicon.ico");
  assert.is(favicon.attr("sizes"), "any");
  const touch = $('link[rel="apple-touch-icon"]');
  assert.is(touch.attr("href"), "/apple-touch-icon.png");
  const favResponse = await get("/favicon.ico");
  assert.is(favResponse.statusCode, 200);
  assert.is(favResponse.headers["content-type"], "image/x-icon");
});

test("manifest", async () => {
  const response = await get("/");
  assert.is(response.statusCode, 200);
  const $ = cheerio.load(response.body);
  const link = $('link[rel="manifest"]');
  assert.is(link.length, 1);
  const href = link.attr("href");
  assert.ok(href.startsWith("/"));
  assert.ok(href.endsWith(".manifest"));
  const manifestResponse = await get(href);
  assert.is(manifestResponse.statusCode, 200);
  const { icons } = JSON.parse(manifestResponse.body);
  const responses = await Promise.all(icons.map((icon) => get(icon.src)));
  const statusCodes = responses.map((r) => r.statusCode);
  assert.ok(statusCodes.every((s) => s === 200));
});

test("home page (page 2)", async () => {
  const response = await get("/p2");
  assert.is(response.statusCode, 200);
  assert.ok(isCached(response));
});

test("plog archive page", async () => {
  const response = await get("/plog");
  assert.is(response.statusCode, 200);
  assert.ok(isCached(response));
});

test("about page", async () => {
  const response = await get("/about");
  assert.is(response.statusCode, 200);
  assert.ok(isCached(response));
});

test("contact page", async () => {
  const response = await get("/contact");
  assert.is(response.statusCode, 200);
  assert.ok(isCached(response));
});

test("filter home page by category", async () => {
  const response = await get("/oc-JavaScript");
  assert.is(response.statusCode, 200);
  assert.ok(isCached(response));
});

test("filter home page by category (page 2)", async () => {
  const response = await get("/oc-JavaScript/p2");
  assert.is(response.statusCode, 200);
  assert.ok(isCached(response));
});

test("filter home page by bad category", async () => {
  const response = await get("/oc-Neverheardof");
  assert.is(response.statusCode, 404);
  assert.ok(isCached(response));
});

test("redirect to correct case of oc categoru", async () => {
  const response = await get("/oc-jAVAsCRIPT");
  assert.is(response.statusCode, 308);
  assert.is(response.headers["location"], "/oc-JavaScript");
});

test("lyrics post page", async () => {
  const response = await get("/plog/blogitem-040601-1");
  assert.is(response.statusCode, 200);
  assert.ok(isCached(response));
});

test("lyrics post page (page 2)", async () => {
  const response = await get("/plog/blogitem-040601-1/p2");
  assert.is(response.statusCode, 200);
  assert.ok(isCached(response));
});

test("certain query strings cause a redirect", async () => {
  for (const querystring of ["comments=all", "magmadomain=something"]) {
    const response = await get(`/anything?${querystring}`);
    assert.is(response.statusCode, 301);
    assert.is(response.headers["location"], "/anything");
  }
});

test("404'ing should not be cached", async () => {
  const response = await get("/plog/thisdoesnotexist");
  assert.is(response.statusCode, 404);
  assert.ok(!isCached(response));
});

test("public image (PNG)", async () => {
  const response = await get("/images/about/youshouldwatch.png");
  assert.is(response.statusCode, 200);
  assert.ok(isCached(response));
  assert.is(response.headers["content-type"], "image/png");
});

test("dynamic image (WEBP)", async () => {
  const response = await get("/images/about/youshouldwatch.webp");
  assert.is(response.statusCode, 200);
  assert.ok(isCached(response));
  assert.is(response.headers["content-type"], "image/webp");
});

test("dynamic image not found (PNG)", async () => {
  const response = await get("/images/about/never-heard-of.png");
  assert.is(response.statusCode, 404);
  assert.ok(isCached(response));
  assert.is(response.headers["content-type"], "text/plain; charset=utf-8");
});

test("dynamic image not found (WEBP)", async () => {
  const response = await get("/images/about/never-heard-of.webp");
  assert.is(response.statusCode, 404);
  assert.ok(isCached(response));
  assert.is(response.headers["content-type"], "text/plain; charset=utf-8");
});

test.run();
