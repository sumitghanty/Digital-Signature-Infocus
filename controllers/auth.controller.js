const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { findUser } = require("../services/user.service");

async function login(req, res) {
  const { username, password } = req.body;

  const user = await findUser(username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret_key_12345',
    { expiresIn: "8h" }
  );

  res.json({ token });
}

module.exports = { login };
