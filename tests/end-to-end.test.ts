import { describe, expect, test } from "vitest";
import cheerio, { CheerioAPI } from "cheerio";
import axios, { AxiosResponse } from "axios";
import axiosRetry, { isNetworkOrIdempotentRequestError } from "axios-retry";
import dotenv from "dotenv";

dotenv.config();

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

const RETRIES = 3;
const TIMEOUT = 1500;

axiosRetry(axios, {
  retries: RETRIES,
  shouldResetTimeout: true,
  retryCondition: (error) => {
    if (
      isNetworkOrIdempotentRequestError(error) ||
      error.code === "ECONNABORTED"
    ) {
      return true;
    }
    console.warn("NOT going to retry on error:", error);
    return false;
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
  uri: string,
  followRedirect = false,
  throwHttpErrors = false,
  { timeout = TIMEOUT, decompress = true, method = "get" } = {}
) {
  try {
    const response = await axios(SERVER_URL + uri, {
      method,
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
      `Axios network error on ${method.toUpperCase()} ${uri} (${JSON.stringify({
        followRedirect,
        throwHttpErrors,
        timeout,
        decompress,
      })})`
    );
  }
}
async function post(
  uri: string,
  followRedirect = false,
  throwHttpErrors = false
) {
  return get(uri, followRedirect, throwHttpErrors, { method: "post" });
}

function isCached(res: AxiosResponse) {
  const cc = res.headers["cache-control"];
  if (!cc) return false;
  const maxAge = parseInt(cc.match(/max-age=(\d+)/)[1], 10);
  return maxAge > 0 && /public/.test(cc);
}

function skipToNavWorks(body: string | CheerioAPI) {
  const $ = typeof body === "string" ? cheerio.load(body) : body;

  const links = $("ul.skip-to-nav a[href]")
    .map((i, element) => $(element).attr("href"))
    .get();
  for (const href of links) {
    if (!$(href).length) {
      console.warn(`No element that matches '${href}'`);
      return false;
    }
  }

  return true;
}

test("home page", async () => {
  const response = await get("/", false, false, { decompress: false });
  expect(response.status).toBe(200);
  expect(isCached(response)).toBe(true);
  expect(response.headers["content-encoding"]).toBe("br");
});

test("home page favicons", async () => {
  const response = await get("/");
  expect(response.status).toBe(200);
  const $ = cheerio.load(response.data);
  const favicon = $('link[rel="icon"]');
  // Based on https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
  expect(favicon.attr("href")).toBe("/favicon.ico");
  expect(favicon.attr("sizes")).toBe("any");
  const touch = $('link[rel="apple-touch-icon"]');
  expect(touch.attr("href")).toBe("/apple-touch-icon.png");
  const favResponse = await get("/favicon.ico");
  expect(favResponse.status).toBe(200);
  expect(favResponse.headers["content-type"]).toBe("image/x-icon");
});

test("manifest", async () => {
  const response = await get("/");
  expect(response.status).toBe(200);
  const $ = cheerio.load(response.data);
  const link = $('link[rel="manifest"]');
  expect(link.length).toBe(1);
  const href = link.attr("href") as string;
  expect(href.startsWith("/")).toBe(true);
  expect(href.endsWith(".manifest")).toBe(true);
  const manifestResponse = await get(href);
  expect(manifestResponse.status).toBe(200);
  type Icon = {
    src: string;
  };
  const icons: Icon[] = manifestResponse.data.icons;
  const responses = await Promise.all(icons.map((icon) => get(icon.src)));
  const statusCodes = responses.map((r) => r.status);
  expect(statusCodes.every((s) => s === 200)).toBe(true);
});

test("home page (page 2)", async () => {
  const response = await get("/p2");
  expect(response.status).toBe(200);
  expect(isCached(response)).toBe(true);
});

test("home page (page 999)", async () => {
  const response = await get("/p999");
  expect(response.status).toBe(404);
});

test("plog archive page", async () => {
  const response = await get("/plog");
  expect(response.status).toBe(200);
  expect(isCached(response)).toBe;
  const $ = cheerio.load(response.data);
  const dts = $("dt")
    .map((i, element) => {
      return $(element).text();
    })
    .get();
  expect(dts.includes("December 2003")).toBe(true);
  expect(dts.includes("January 2020")).toBe(true);
});

test("plog archive page redirect trailing slash", async () => {
  const response = await get("/plog/", false);
  expect(response.status).toBe(302);
  expect(response.headers["location"]).toBe("/plog");
});

test("about page", async () => {
  const response = await get("/about");
  expect(response.status).toBe(200);
  expect(isCached(response)).toBe(true);
});

test("contact page", async () => {
  const response = await get("/contact");
  expect(response.status).toBe(200);
  expect(isCached(response)).toBe(true);
});

test("filter home page by category", async () => {
  const response = await get("/oc-JavaScript");
  expect(response.status).toBe(200);
  expect(isCached(response)).toBe(true);
});

test("filter home page by category (page 2)", async () => {
  const response = await get("/oc-JavaScript/p2");
  expect(response.status).toBe(200);
  expect(isCached(response)).toBe(true);
});

test("filter home page by bad category", async () => {
  const response = await get("/oc-Neverheardof");
  expect(response.status).toBe(404);
  expect(isCached(response)).toBe(true);
});

test("redirect to correct case of oc categoru", async () => {
  const response = await get("/oc-jAVAsCRIPT");
  expect(response.status).toBe(308);
  expect(response.headers["location"]).toBe("/oc-JavaScript");
});

test("lyrics post page", async () => {
  const response = await get("/plog/blogitem-040601-1");
  expect(response.status).toBe(200);
  expect(isCached(response)).toBe(true);
});

test("lyrics post page (page 2)", async () => {
  const response = await get("/plog/blogitem-040601-1/p2");
  expect(response.status).toBe(200);
  expect(isCached(response)).toBe(true);
});

test("lyrics post page (page 999)", async () => {
  const response = await get("/plog/blogitem-040601-1/p999");
  expect(response.status).toBe(404);
});

test("lyrics post page (trailing slash)", async () => {
  const response = await get("/plog/blogitem-040601-1/");
  expect(response.status).toBe(302);
  expect(response.headers["location"]).toBe("/plog/blogitem-040601-1");
});

test("lyrics post page (/p1)", async () => {
  const response = await get("/plog/blogitem-040601-1/p1");
  expect(response.status).toBe(302);
  expect(response.headers["location"]).toBe("/plog/blogitem-040601-1");
});

test("certain query strings cause a redirect", async () => {
  for (const querystring of ["comments=all", "magmadomain=something"]) {
    const response = await get(`/anything?${querystring}`);
    expect(response.status).toBe(301);
    expect(response.headers["location"]).toBe("/anything");
  }
});

test("404'ing should not be cached", async () => {
  const response = await get("/plog/thisdoesnotexist");
  expect(response.status).toBe(404);
  expect(isCached(response)).toBe(false);
});

test("public image (PNG)", async () => {
  const response = await get("/images/about/youshouldwatch.png");
  expect(response.status).toBe(200);
  expect(isCached(response)).toBe(true);
  expect(response.headers["content-type"]).toBe("image/png");
});

test("dynamic image (WEBP)", async () => {
  const response = await get("/images/about/youshouldwatch.webp");
  expect(response.status).toBe(200);
  expect(isCached(response)).toBe(true);
  expect(response.headers["content-type"]).toBe("image/webp");
});

test("dynamic image not found (PNG)", async () => {
  const response = await get("/images/about/never-heard-of.png");
  expect(response.status).toBe(404);
  expect(isCached(response)).toBe(true);
  expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8");
});

test("dynamic image not found (WEBP)", async () => {
  const response = await get("/images/about/never-heard-of.webp");
  expect(response.status).toBe(404);
  expect(isCached(response)).toBe(true);
  expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8");
});

test("pages have the GA analytics tag", async () => {
  for (const url of [
    "/",
    "/about",
    "/contact",
    "/plog",
    "/plog/blogitem-040601-1",
    "/plog/blogitem-20030629-2128",
  ]) {
    const response = await get(url);
    expect(response.status).toBe(200);
    const id = process.env.GA_TRACKING_ID;
    expect(response.data.includes(id)).toBe(true);
  }
});

test("canonical link on home page", async () => {
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
    expect(response.status).toBe(200);
    const $ = cheerio.load(response.data);
    const href = $('link[rel="canonical"]').attr("href");
    expect(href).toBe("https://www.peterbe.com" + url);
  }
});

test("strange Chinese searches", async () => {
  const sp = new URLSearchParams({
    q: "大发00体育-%28备用网站%20KL99%fff%29-乐动体育-永盈会体育-亿博体育",
  });
  const response = await get(`/search?${sp}`);
  expect(response.status).toBe(400);
  expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8");
});

test("ok Chinese searches", async () => {
  const sp = new URLSearchParams({
    q: "彼得",
  });
  const response = await get(`/search?${sp}`);
  expect(response.status).toBe(200);
});

test("junk URLs", async () => {
  for (const url of [
    "/xmlrpc.php",
    "/blog/wp-login.php",
    "/about/wp-login.php",
  ]) {
    const response = await get(url);
    expect(response.status).toBe(400);
    expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8");
  }
});

test("go to blog post with trailing slash", async () => {
  const response = await get("/plog/blogitem-20030629-2128/");
  expect(response.status).toBe(302);
  expect(response.headers["location"]).toBe("/plog/blogitem-20030629-2128");
});

test("go to blog post with trailing /p1", async () => {
  const response = await get("/plog/blogitem-20030629-2128/p1");
  expect(response.status).toBe(302);
  expect(response.headers["location"]).toBe("/plog/blogitem-20030629-2128");
});

test("redirect from trailing slash with Unicode", async () => {
  const response = await get("/plog/تیک/");
  expect(response.status).toBe(302);
  expect(response.headers["location"]).toBe(encodeURI("/plog/تیک"));
});

test("redirect from trailing /1 with Unicode", async () => {
  const response = await get("/plog/تیک/p1");
  expect(response.status).toBe(302);
  expect(response.headers["location"]).toBe(encodeURI("/plog/تیک"));
});

test("redirect from urls with & without a ?", async () => {
  const response = await get("/&a=b");
  expect(response.status).toBe(302);
  expect(response.headers["location"]).toBe("/");
});

test("redirect from urls with & before the ?", async () => {
  const response = await get("/&a=b?c=d");
  expect(response.status).toBe(302);
  expect(response.headers["location"]).toBe("/");
});

test("search skeleton page", async () => {
  const response = await get("/search?q=stuff", false, false, {
    decompress: false,
  });
  expect(response.status).toBe(200);
  expect(isCached(response)).toBe(true);
  expect(response.headers["content-encoding"]).toBe("br");
});

test("POST request to pages should 405", async () => {
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
    const response = await post(url);
    expect(response.status).toBe(405);
  }
});

test("skip-to-nav", async () => {
  for (const url of [
    "/",
    "/about",
    "/contact",
    "/plog",
    "/plog/blogitem-20030629-2128",
  ]) {
    const response = await get(url);
    expect(response.status).toBe(200);
    expect(skipToNavWorks(response.data)).toBe(true);
  }
});
