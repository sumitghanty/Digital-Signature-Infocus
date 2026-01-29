const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const db = require("../utils/db");

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(stderr || err.message);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function generatePfx(req, res) {
  const { password } = req.body;
  const userId = req.user.id;

  if (!password || password.length < 6) {
    return res.status(400).json({
      error: "PFX password must be at least 6 characters"
    });
  }

  await db.read();
  const user = db.data.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const certDir = path.join(__dirname, "../certs");
  if (!fs.existsSync(certDir)) fs.mkdirSync(certDir);

  const base = `${user.username}-${Date.now()}`;
  const keyPath = path.join(certDir, `${base}.key`);
  const crtPath = path.join(certDir, `${base}.crt`);
  const pfxPath = path.join(certDir, `${base}.pfx`);

  try {
    // 1️⃣ Generate key + cert
    await run(
      `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${crtPath}" -days 365 -subj "/CN=${user.username}" -nodes`
    );

    // 2️⃣ Generate pfx
    await run(
      `openssl pkcs12 -export -out "${pfxPath}" -inkey "${keyPath}" -in "${crtPath}" -password pass:${password}`
    );

    // 3️⃣ Verify pfx exists
    if (!fs.existsSync(pfxPath)) {
      throw new Error("PFX file not created");
    }

    // 4️⃣ Cleanup
    fs.unlinkSync(keyPath);
    fs.unlinkSync(crtPath);

    // 5️⃣ Save only AFTER success
    user.pfx = pfxPath;
    user.pfxPass = password;
    await db.write();

    res.json({
      message: "PFX generated successfully",
      pfx: pfxPath
    });

  } catch (err) {
    console.error("PFX generation failed:", err);

    // cleanup partial files
    [keyPath, crtPath, pfxPath].forEach(f => {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    });

    res.status(500).json({
      error: "Certificate generation failed",
      details: err.toString()
    });
  }
}

module.exports = { generatePfx };
