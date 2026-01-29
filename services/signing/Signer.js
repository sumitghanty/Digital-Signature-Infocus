class Signer {
  async sign({ inputPdf, outputPdf, user }) {
    throw new Error("Signer not implemented");
  }
}

module.exports = Signer;
