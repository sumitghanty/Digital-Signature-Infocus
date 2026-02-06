const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });

  const token = auth.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_12345');
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
