// src/middleware/logger.js
// Assembly-line station: logs method, URL, status and time for every request.
module.exports = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start} ms)`);
  });
  next(); // without this the request never reaches the route
};
