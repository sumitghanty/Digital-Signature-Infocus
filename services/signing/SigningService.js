const InternalSigner = require("./InternalSigner");

class SigningService {
  constructor() {
    this.signer = new InternalSigner();
  }

  async signPdf(params) {
    // params includes { inputPdf, outputPdf, user, signatureImage }
    return this.signer.sign(params);
  }
}

module.exports = new SigningService();
