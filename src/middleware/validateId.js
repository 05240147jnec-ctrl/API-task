// src/middleware/validateId.js
// Used with router.param('id', validateId). Rejects ids like "abc" or "-5"
// with 400 before they reach the controller.
module.exports = (req, res, next, id) => {
  if (!/^\d+$/.test(id) || Number(id) < 1) {
    return res.status(400).json({ error: 'id must be a positive whole number' });
  }
  next();
};
