const db = require("../utils/db");
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");

async function createUser({ username, password, role }) {
  await db.read();

  if (db.data.users.find(u => u.username === username))
    throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = {
    id: uuid(),
    username,
    password: hashed,
    role,
    pfx: null,
    pfxPass: null
  };

  db.data.users.push(user);
  await db.write();
  return user;
}

async function findUser(username) {
  await db.read();
  return db.data.users.find(u => u.username === username);
}

module.exports = { createUser, findUser };
