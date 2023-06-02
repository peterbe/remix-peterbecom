export function ip(req, res, next) {
  res.status(200).json({
    ip: req.ip || null,
    "remote-addr": req.connection.remoteAddress || null,
    "x-forwarded-for": req.headers["x-forwarded-for"] || null,
  });
}
