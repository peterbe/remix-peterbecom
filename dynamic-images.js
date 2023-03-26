const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const PUBLIC_DIR = path.resolve("public");

async function dynamicImages(req, res, next) {
  //   console.log({ "req.url": req.url });
  if (!req.url.startsWith("/images/")) return next();
  if (!(req.method === "GET" || req.method === "HEAD")) {
    return res.status(405).type("text/plain").send("Method Not Allowed");
  }

  try {
    if (req.path.endsWith(".webp")) {
      const pngPath = path.join(
        PUBLIC_DIR,
        req.url.slice(1).replace(/\.webp$/, ".png")
      );
      const originalBuffer = await fs.readFile(pngPath);
      const image = sharp(originalBuffer);
      const buffer = await image.webp().toBuffer();
      res.set("cache-control", `public,max-age=${60 * 60 * 24}`);
      return res.type("image/webp").send(buffer);
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  res.status(404).type("text/plain").send("image not found");
}

module.exports = { dynamicImages };
