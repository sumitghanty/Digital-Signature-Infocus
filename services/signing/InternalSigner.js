const fs = require("fs");
const Signer = require("./Signer");
const signer = require("node-signpdf").default;
const { plainAddPlaceholder } = require("node-signpdf/dist/helpers");

class InternalSigner extends Signer {
  async sign({ inputPdf, outputPdf, user }) {
    if (!user.pfx || !user.pfxPass) {
      throw new Error("User has no PFX configured");
    }

    const pdfBuffer = fs.readFileSync(inputPdf);
    const pfxBuffer = fs.readFileSync(user.pfx);

    const pdfWithPlaceholder = plainAddPlaceholder({
      pdfBuffer,
      reason: "Internal Approval",
      name: user.username,
      location: "Internal System",
      contactInfo: user.username
    });

    const signedPdf = signer.sign(pdfWithPlaceholder, pfxBuffer, {
      passphrase: user.pfxPass
    });

    fs.writeFileSync(outputPdf, signedPdf);
  }
}

module.exports = InternalSigner;
