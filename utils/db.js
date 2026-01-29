const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const path = require("path");

const file = path.join(__dirname, "../data/users.json");
const adapter = new JSONFile(file);

// ✅ default data MUST be provided
const defaultData = { users: [] };

const db = new Low(adapter, defaultData);

async function init() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
}

init();

module.exports = db;
