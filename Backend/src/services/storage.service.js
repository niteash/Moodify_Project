const ImageKit = require("@imagekit/nodejs").default;

const Client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadFileToImageKit({ buffer, fileName, folder = "" }) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError(
      `Expected a Buffer for "${fileName}", received ${
        buffer?.constructor?.name || typeof buffer
      }`,
    );
  }

  const file = await Client.files.upload({
    file: await ImageKit.toFile(buffer, fileName),
    fileName,
    folder,
  });

  return file;
}

module.exports = {
  uploadFileToImageKit,
};
