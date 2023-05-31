const JUNK_PATH_BASENAME = new Set([
  "wp-login.php",
  "wp-admin.php",
  "xmlrpc.php",
]);

export function junkBlock(req, res, next) {
  if (req.query.q && req.query.q.length > 10) {
    if (countChineseCharacters(req.query.q) > 10) {
      return res.status(400).type("text").send("Too many Chinese characters");
    }
  }

  const last = req.path.split("/").at(-1);
  if (JUNK_PATH_BASENAME.has(last)) {
    return res.status(400).type("text").send("Junk path basename");
  }

  // Any request that uses & without a & is junk
  if (req.path.includes("&") && !req.path.includes("?")) {
    return res.redirect(req.path.split("&")[0]);
  }

  return next();
}

function countChineseCharacters(str) {
  return (str.match(/[\u00ff-\uffff]/g) || []).length;
}
