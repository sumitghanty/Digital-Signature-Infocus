const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/auth.middleware");
const { signPdf, downloadSigned } = require("../controllers/sign.controller");

const upload = multer({
  dest: path.join(__dirname, "../uploads"),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files allowed"));
    } else {
      cb(null, true);
    }
  }
});

router.post("/", auth, upload.single("pdf"), signPdf);
router.get("/:filename", auth, downloadSigned);

module.exports = router;
