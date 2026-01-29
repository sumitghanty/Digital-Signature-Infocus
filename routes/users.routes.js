const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { create } = require("../controllers/users.controller");
const { generatePfx } = require("../controllers/pfx.controller");

router.post("/", auth, role("admin"), create);
router.post("/pfx", auth, generatePfx);

module.exports = router;
