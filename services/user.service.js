const User = require("../models/User");
const bcrypt = require("bcrypt");

async function createUser({ username, password, role }) {
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashed,
    role: role || 'user'
  });

  return user.toJSON();
}

async function findUser(username) {
  const user = await User.findOne({ where: { username } });
  return user ? user.toJSON() : null;
}

module.exports = { createUser, findUser };
