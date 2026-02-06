const fs = require("fs");
const Signer = require("./Signer");
const signer = require("node-signpdf").default;
const { plainAddPlaceholder } = require("node-signpdf/dist/helpers");
const { PDFDocument } = require("pdf-lib");

class InternalSigner extends Signer {
  async sign({ inputPdf, outputPdf, user, signatureImage }) {
    if (!user.pfx || !user.pfxPass) {
      throw new Error("User has no PFX configured");
    }

    let pdfBuffer = fs.readFileSync(inputPdf);
    const pfxBuffer = fs.readFileSync(user.pfx);

    // 1. Add Visual Signature (if provided)
    if (signatureImage) {
      try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const image = await pdfDoc.embedPng(signatureImage);

        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1]; // Default to last page
        const { width } = lastPage.getSize();

        // Scale image keeping aspect ratio
        const imgWidth = 150;
        const imgHeight = (image.height / image.width) * imgWidth;

        // Draw at bottom right, slightly padded
        lastPage.drawImage(image, {
          x: width - imgWidth - 50,
          y: 50,
          width: imgWidth,
          height: imgHeight,
        });

        const modifiedBytes = await pdfDoc.save({ useObjectStreams: false });
        pdfBuffer = Buffer.from(modifiedBytes);

      } catch (err) {
        console.error("Failed to embed visual signature:", err);
        // Continue to text signing even if visual fails
      }
    }

    // 2. Add Placeholder for Digital Signature
    const pdfWithPlaceholder = plainAddPlaceholder({
      pdfBuffer,
      reason: "Digitally Signed by InFocus",
      name: user.username,
      location: "InFocus System",
      contactInfo: user.username
    });

    // 3. Digitally Sign
    const signedPdf = signer.sign(pdfWithPlaceholder, pfxBuffer, {
      passphrase: user.pfxPass
    });

    fs.writeFileSync(outputPdf, signedPdf);
  }
}

module.exports = InternalSigner;
