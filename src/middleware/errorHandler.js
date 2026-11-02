// src/middleware/errorHandler.js
// notFound: runs when no route matched. errorHandler: 4 parameters, so Express
// treats it as the global error handler. It must be registered LAST.
const notFound = (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack); // full detail stays on the server

  // express.json() throws status 400 for malformed JSON bodies
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: status >= 500 ? 'Internal Server Error' : err.message,
  });
};

module.exports = { notFound, errorHandler };
