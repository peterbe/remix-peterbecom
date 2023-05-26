export function junkBlock(req, res, next) {
  if (req.query.q && req.query.q.length > 10) {
    if (countChineseCharacters(req.query.q) > 10) {
      return res.status(400).send("Too many Chinese characters");
    }
  }

  return next();
}

function countChineseCharacters(str) {
  return (str.match(/[\u00ff-\uffff]/g) || []).length;
}
