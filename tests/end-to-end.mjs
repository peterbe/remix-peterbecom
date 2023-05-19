import test from "ava";
import cheerio from "cheerio";
import got from "got";
import dotenv from "dotenv";

dotenv.config();
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

test("home page", async (t) => {
  const response = await get("/");
  t.is(response.statusCode, 200);
  t.true(isCached(response));
  t.is(response.headers["content-encoding"], "br");
});

test("home page favicons", async (t) => {
  const response = await get("/");
  t.is(response.statusCode, 200);
  const $ = cheerio.load(response.body);
  const favicon = $('link[rel="icon"]');
  // Based on https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
  t.is(favicon.attr("href"), "/favicon.ico");
  t.is(favicon.attr("sizes"), "any");
  const touch = $('link[rel="apple-touch-icon"]');
  t.is(touch.attr("href"), "/apple-touch-icon.png");
  const favResponse = await get("/favicon.ico");
  t.is(favResponse.statusCode, 200);
  t.is(favResponse.headers["content-type"], "image/x-icon");
});

test("manifest", async (t) => {
  const response = await get("/");
  t.is(response.statusCode, 200);
  const $ = cheerio.load(response.body);
  const link = $('link[rel="manifest"]');
  t.is(link.length, 1);
  const href = link.attr("href");
  t.true(href.startsWith("/"));
  t.true(href.endsWith(".manifest"));
  const manifestResponse = await get(href);
  t.is(manifestResponse.statusCode, 200);
  const { icons } = JSON.parse(manifestResponse.body);
  const responses = await Promise.all(icons.map((icon) => get(icon.src)));
  const statusCodes = responses.map((r) => r.statusCode);
  t.true(statusCodes.every((s) => s === 200));
});

test("home page (page 2)", async (t) => {
  const response = await get("/p2");
  t.is(response.statusCode, 200);
  t.true(isCached(response));
});

test("home page (page 999)", async (t) => {
  const response = await get("/p999");
  t.is(response.statusCode, 404);
});

test("plog archive page", async (t) => {
  const response = await get("/plog");
  t.is(response.statusCode, 200);
  t.true(isCached(response));
  const $ = cheerio.load(response.body);
  const dts = $("dt")
    .map((i, element) => {
      return $(element).text();
    })
    .get();
  t.true(dts.includes("December 2003"));
  t.true(dts.includes("January 2020"));
});

test("plog archive page redirect trailing slash", async (t) => {
  const response = await get("/plog/", false);
  t.is(response.statusCode, 302);
  t.is(response.headers["location"], "/plog");
});

test("about page", async (t) => {
  const response = await get("/about");
  t.is(response.statusCode, 200);
  t.true(isCached(response));
});

test("contact page", async (t) => {
  const response = await get("/contact");
  t.is(response.statusCode, 200);
  t.true(isCached(response));
});

test("filter home page by category", async (t) => {
  const response = await get("/oc-JavaScript");
  t.is(response.statusCode, 200);
  t.true(isCached(response));
});

test("filter home page by category (page 2)", async (t) => {
  const response = await get("/oc-JavaScript/p2");
  t.is(response.statusCode, 200);
  t.true(isCached(response));
});

test("filter home page by bad category", async (t) => {
  const response = await get("/oc-Neverheardof");
  t.is(response.statusCode, 404);
  t.true(isCached(response));
});

test("redirect to correct case of oc categoru", async (t) => {
  const response = await get("/oc-jAVAsCRIPT");
  t.is(response.statusCode, 308);
  t.is(response.headers["location"], "/oc-JavaScript");
});

test("lyrics post page", async (t) => {
  const response = await get("/plog/blogitem-040601-1");
  t.is(response.statusCode, 200);
  t.true(isCached(response));
});

test("lyrics post page (page 2)", async (t) => {
  const response = await get("/plog/blogitem-040601-1/p2");
  t.is(response.statusCode, 200);
  t.true(isCached(response));
});

test("lyrics post page (page 999)", async (t) => {
  const response = await get("/plog/blogitem-040601-1/p999");
  t.is(response.statusCode, 404);
});

test("lyrics post page (trailing slash)", async (t) => {
  const response = await get("/plog/blogitem-040601-1/");
  t.is(response.statusCode, 302);
  t.is(response.headers["location"], "/plog/blogitem-040601-1");
});

test("lyrics post page (/p1)", async (t) => {
  const response = await get("/plog/blogitem-040601-1/p1");
  t.is(response.statusCode, 302);
  t.is(response.headers["location"], "/plog/blogitem-040601-1");
});

test("certain query strings cause a redirect", async (t) => {
  for (const querystring of ["comments=all", "magmadomain=something"]) {
    const response = await get(`/anything?${querystring}`);
    t.is(response.statusCode, 301);
    t.is(response.headers["location"], "/anything");
  }
});

test("404'ing should not be cached", async (t) => {
  const response = await get("/plog/thisdoesnotexist");
  t.is(response.statusCode, 404);
  t.true(!isCached(response));
});

test("public image (PNG)", async (t) => {
  const response = await get("/images/about/youshouldwatch.png");
  t.is(response.statusCode, 200);
  t.true(isCached(response));
  t.is(response.headers["content-type"], "image/png");
});

test("dynamic image (WEBP)", async (t) => {
  const response = await get("/images/about/youshouldwatch.webp");
  t.is(response.statusCode, 200);
  t.true(isCached(response));
  t.is(response.headers["content-type"], "image/webp");
});

test("dynamic image not found (PNG)", async (t) => {
  const response = await get("/images/about/never-heard-of.png");
  t.is(response.statusCode, 404);
  t.true(isCached(response));
  t.is(response.headers["content-type"], "text/plain; charset=utf-8");
});

test("dynamic image not found (WEBP)", async (t) => {
  const response = await get("/images/about/never-heard-of.webp");
  t.is(response.statusCode, 404);
  t.true(isCached(response));
  t.is(response.headers["content-type"], "text/plain; charset=utf-8");
});

test("pages have the GA analytics tag", async (t) => {
  for (const url of [
    "/",
    "/about",
    "/contact",
    "/plog",
    "/plog/blogitem-040601-1",
    "/plog/blogitem-20030629-2128",
  ]) {
    const response = await get(url);
    t.is(response.statusCode, 200);
    const id = process.env.GA_TRACKING_ID;
    t.true(response.body.includes(id));
  }
});

test("canonical link on home page", async (t) => {
  for (const url of [
    "/",
    "/p2",
    "/oc-Web+development",
    "/about",
    "/contact",
    "/search",
    "/plog",
    "/plog/blogitem-040601-1",
    "/plog/blogitem-20030629-2128",
  ]) {
    const response = await get(url);
    t.is(response.statusCode, 200);
    const $ = cheerio.load(response.body);
    const href = $('link[rel="canonical"]').attr("href");
    t.is(href, "https://www.peterbe.com" + url);
  }
});
