const { createUser } = require("../services/user.service");

async function create(req, res) {
  try {
    const user = await createUser(req.body);
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

module.exports = { create };
