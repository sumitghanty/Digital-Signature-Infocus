const InternalSigner = require("./InternalSigner");

class SigningService {
  constructor() {
    this.signer = new InternalSigner(); // swap later
  }

  async signPdf(params) {
    return this.signer.sign(params);
  }
}

module.exports = new SigningService();
