const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const signingService = require("../services/signing/SigningService");

async function signPdf(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "PDF file required" });
  }

  const user = await User.findByPk(req.user.id);
  // Map User model fields to what the signing service expects
  // The service expects user.pfx and user.pfxPass, but our model has pfxPath and pfxPassword
  const userData = user ? user.toJSON() : null;
  if (userData) {
    userData.pfx = userData.pfxPath;
    userData.pfxPass = userData.pfxPassword;
  }

  if (!userData) return res.status(404).json({ error: "User not found" });

  const signedDir = path.join(__dirname, "../signed");
  if (!fs.existsSync(signedDir)) fs.mkdirSync(signedDir);

  const outputFile = `signed-${Date.now()}-${req.file.originalname}`;
  const outputPath = path.join(signedDir, outputFile);

  // Handle Visual Signature
  let signatureImage = null;
  if (req.body.signatureImage) {
    try {
      const matches = req.body.signatureImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        signatureImage = Buffer.from(matches[2], 'base64');
      } else {
        signatureImage = Buffer.from(req.body.signatureImage, 'base64');
      }
    } catch (e) {
      console.error("Invalid signature image format", e);
    }
  }

  try {
    await signingService.signPdf({
      inputPdf: req.file.path,
      outputPdf: outputPath,
      user: userData,
      signatureImage
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
