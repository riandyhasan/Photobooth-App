const { google } = require("googleapis");
const axios = require("axios");
const email = process.env.CLIENT_EMAIL;
const key = process.env.PRIVATE_KEY;

const auth = new google.auth.JWT({
  email,
  key,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth: oAuth2Client });

async function getFileMetadata(fileId) {
  try {
    const { data } = await drive.files.get({ fileId });
    return data;
  } catch (e) {
    throw e;
  }
}

async function downloadFileAsBlob(fileId) {
  try {
    const response = await axios({
      method: "GET",
      url: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      headers: {
        Authorization: `Bearer ${auth.creadentials.access_token}`,
      },
    });

    return Buffer.from(response.data, "binary").toString("base64");
  } catch (e) {
    throw e;
  }
}

module.exports = {
  getFileMetadata,
  downloadFileAsBlob,
};
