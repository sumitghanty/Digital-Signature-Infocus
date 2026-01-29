const path = require("path");
const fs = require("fs");
const db = require("../utils/db");
const signingService = require("../services/signing/SigningService");

async function signPdf(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "PDF file required" });
  }

  await db.read();
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const signedDir = path.join(__dirname, "../signed");
  if (!fs.existsSync(signedDir)) fs.mkdirSync(signedDir);

  const outputFile = `signed-${Date.now()}-${req.file.originalname}`;
  const outputPath = path.join(signedDir, outputFile);

  try {
    await signingService.signPdf({
      inputPdf: req.file.path,
      outputPdf: outputPath,
      user
    });

    res.json({
      message: "PDF signed successfully",
      file: outputFile
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Signing failed",
      details: err.toString()
    });
  }
}

async function downloadSigned(req, res) {
  const filePath = path.join(__dirname, "../signed", req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  res.download(filePath);
}

module.exports = { signPdf, downloadSigned };
