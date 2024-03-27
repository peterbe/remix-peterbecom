import test from "ava";
import cheerio from "cheerio";
import axios from "axios";
import axiosRetry, { isNetworkOrIdempotentRequestError } from "axios-retry";
import dotenv from "dotenv";

dotenv.config();
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const RETRIES = 3;
const TIMEOUT = 1500;

axiosRetry(axios, {
  retries: RETRIES,
  shouldResetTimeout: true,
  retryCondition: (error) => {
    return (
      isNetworkOrIdempotentRequestError(error) || error.code === "ECONNABORTED"
    );
  },
  onRetry: (retryCount, error) => {
    console.log(`Retrying (${retryCount}) on ${error.request.path}`);
    return;
  },
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
});

async function get(
  uri,
  followRedirect = false,
  throwHttpErrors = false,
  { timeout = TIMEOUT, decompress = true } = {}
) {
  try {
    const response = await axios.get(BASE_URL + uri, {
      timeout,
      decompress,
      maxRedirects: followRedirect ? 10 : 0,
      validateStatus: function (status) {
        if (throwHttpErrors) return status >= 200 && status < 300; // default
        return true;
      },
    });
    return response;
  } catch (err) {
    throw new Error(
      `Axios network error on ${uri} (${JSON.stringify({
        followRedirect,
        throwHttpErrors,
        timeout,
        decompress,
      })})`
    );
  }
}

function isCached(res) {
  const cc = res.headers["cache-control"];
  if (!cc) return false;
  const maxAge = parseInt(cc.match(/max-age=(\d+)/)[1], 10);
  return maxAge > 0 && /public/.test(cc);
}

test("home page", async (t) => {
  const response = await get("/", false, false, { decompress: false });
  t.is(response.status, 200);
  t.true(isCached(response));
  t.is(response.headers["content-encoding"], "br");
});

test("home page favicons", async (t) => {
  const response = await get("/");
  t.is(response.status, 200);
  const $ = cheerio.load(response.data);
  const favicon = $('link[rel="icon"]');
  // Based on https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
  t.is(favicon.attr("href"), "/favicon.ico");
  t.is(favicon.attr("sizes"), "any");
  const touch = $('link[rel="apple-touch-icon"]');
  t.is(touch.attr("href"), "/apple-touch-icon.png");
  const favResponse = await get("/favicon.ico");
  t.is(favResponse.status, 200);
  t.is(favResponse.headers["content-type"], "image/x-icon");
});

test("manifest", async (t) => {
  const response = await get("/");
  t.is(response.status, 200);
  const $ = cheerio.load(response.data);
  const link = $('link[rel="manifest"]');
  t.is(link.length, 1);
  const href = link.attr("href");
  t.true(href.startsWith("/"));
  t.true(href.endsWith(".manifest"));
  const manifestResponse = await get(href);
  t.is(manifestResponse.status, 200);
  const { icons } = manifestResponse.data;
  const responses = await Promise.all(icons.map((icon) => get(icon.src)));
  const statusCodes = responses.map((r) => r.status);
  t.true(statusCodes.every((s) => s === 200));
});

test("home page (page 2)", async (t) => {
  const response = await get("/p2");
  t.is(response.status, 200);
  t.true(isCached(response));
});

test("home page (page 999)", async (t) => {
  const response = await get("/p999");
  t.is(response.status, 404);
});

test("plog archive page", async (t) => {
  const response = await get("/plog");
  t.is(response.status, 200);
  t.true(isCached(response));
  const $ = cheerio.load(response.data);
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
  t.is(response.status, 302);
  t.is(response.headers["location"], "/plog");
});

test("about page", async (t) => {
  const response = await get("/about");
  t.is(response.status, 200);
  t.true(isCached(response));
});

test("contact page", async (t) => {
  const response = await get("/contact");
  t.is(response.status, 200);
  t.true(isCached(response));
});

test("filter home page by category", async (t) => {
  const response = await get("/oc-JavaScript");
  t.is(response.status, 200);
  t.true(isCached(response));
});

test("filter home page by category (page 2)", async (t) => {
  const response = await get("/oc-JavaScript/p2");
  t.is(response.status, 200);
  t.true(isCached(response));
});

test("filter home page by bad category", async (t) => {
  const response = await get("/oc-Neverheardof");
  t.is(response.status, 404);
  t.true(isCached(response));
});

test("redirect to correct case of oc categoru", async (t) => {
  const response = await get("/oc-jAVAsCRIPT");
  t.is(response.status, 308);
  t.is(response.headers["location"], "/oc-JavaScript");
});

test("lyrics post page", async (t) => {
  const response = await get("/plog/blogitem-040601-1");
  t.is(response.status, 200);
  t.true(isCached(response));
});

test("lyrics post page (page 2)", async (t) => {
  const response = await get("/plog/blogitem-040601-1/p2");
  t.is(response.status, 200);
  t.true(isCached(response));
});

test("lyrics post page (page 999)", async (t) => {
  const response = await get("/plog/blogitem-040601-1/p999");
  t.is(response.status, 404);
});

test("lyrics post page (trailing slash)", async (t) => {
  const response = await get("/plog/blogitem-040601-1/");
  t.is(response.status, 302);
  t.is(response.headers["location"], "/plog/blogitem-040601-1");
});

test("lyrics post page (/p1)", async (t) => {
  const response = await get("/plog/blogitem-040601-1/p1");
  t.is(response.status, 302);
  t.is(response.headers["location"], "/plog/blogitem-040601-1");
});

test("certain query strings cause a redirect", async (t) => {
  for (const querystring of ["comments=all", "magmadomain=something"]) {
    const response = await get(`/anything?${querystring}`);
    t.is(response.status, 301);
    t.is(response.headers["location"], "/anything");
  }
});

test("404'ing should not be cached", async (t) => {
  const response = await get("/plog/thisdoesnotexist");
  t.is(response.status, 404);
  t.true(!isCached(response));
});

test("public image (PNG)", async (t) => {
  const response = await get("/images/about/youshouldwatch.png");
  t.is(response.status, 200);
  t.true(isCached(response));
  t.is(response.headers["content-type"], "image/png");
});

test("dynamic image (WEBP)", async (t) => {
  const response = await get("/images/about/youshouldwatch.webp");
  t.is(response.status, 200);
  t.true(isCached(response));
  t.is(response.headers["content-type"], "image/webp");
});

test("dynamic image not found (PNG)", async (t) => {
  const response = await get("/images/about/never-heard-of.png");
  t.is(response.status, 404);
  t.true(isCached(response));
  t.is(response.headers["content-type"], "text/plain; charset=utf-8");
});

test("dynamic image not found (WEBP)", async (t) => {
  const response = await get("/images/about/never-heard-of.webp");
  t.is(response.status, 404);
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
    t.is(response.status, 200);
    const id = process.env.GA_TRACKING_ID;
    t.true(response.data.includes(id));
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
    t.is(response.status, 200);
    const $ = cheerio.load(response.data);
    const href = $('link[rel="canonical"]').attr("href");
    t.is(href, "https://www.peterbe.com" + url);
  }
});

test("strange Chinese searches", async (t) => {
  const sp = new URLSearchParams({
    q: "大发00体育-%28备用网站%20KL99%fff%29-乐动体育-永盈会体育-亿博体育",
  });
  const response = await get(`/search?${sp}`);
  t.is(response.status, 400);
  t.is(response.headers["content-type"], "text/plain; charset=utf-8");
});

test("ok Chinese searches", async (t) => {
  const sp = new URLSearchParams({
    q: "彼得",
  });
  const response = await get(`/search?${sp}`);
  t.is(response.status, 200);
});

test("junk URLs", async (t) => {
  for (const url of [
    "/xmlrpc.php",
    "/blog/wp-login.php",
    "/about/wp-login.php",
  ]) {
    const response = await get(url);
    t.is(response.status, 400);
    t.is(response.headers["content-type"], "text/plain; charset=utf-8");
  }
});

test("go to blog post with trailing slash", async (t) => {
  const response = await get("/plog/blogitem-20030629-2128/");
  t.is(response.status, 302);
  t.is(response.headers["location"], "/plog/blogitem-20030629-2128");
});

test("go to blog post with trailing /p1", async (t) => {
  const response = await get("/plog/blogitem-20030629-2128/p1");
  t.is(response.status, 302);
  t.is(response.headers["location"], "/plog/blogitem-20030629-2128");
});

test("redirect from trailing slash with Unicode", async (t) => {
  const response = await get("/plog/تیک/");
  t.is(response.status, 302);
  t.is(response.headers["location"], encodeURI("/plog/تیک"));
});

test("redirect from trailing /1 with Unicode", async (t) => {
  const response = await get("/plog/تیک/p1");
  t.is(response.status, 302);
  t.is(response.headers["location"], encodeURI("/plog/تیک"));
});

test("redirect from urls with & without a ?", async (t) => {
  const response = await get("/&a=b");
  t.is(response.status, 302);
  t.is(response.headers["location"], "/");
});

test("redirect from urls with & before the ?", async (t) => {
  const response = await get("/&a=b?c=d");
  t.is(response.status, 302);
  t.is(response.headers["location"], "/");
});

test("search skeleton page", async (t) => {
  const response = await get("/search?q=stuff", false, false, {
    decompress: false,
  });
  t.is(response.status, 200);
  t.true(isCached(response));
  t.is(response.headers["content-encoding"], "br");
});
