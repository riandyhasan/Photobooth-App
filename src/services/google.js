const { google } = require("googleapis");
const axios = require("axios");

const email = env.process.EMAIL;
const key = env.process.KEY;

function initDrive() {
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });

  return new Promise((resolve, reject) => {
    auth.authorize((err, response) => {
      if (err) {
        reject(err);
        return;
      }

      const getFileMetadata = async (fileId) => {
        try {
          const { data } = await drive.files.get({ fileId });
          return data;
        } catch (e) {
          throw e;
        }
      };

      const downloadFileAsBlob = async (fileId) => {
        try {
          const response = await axios({
            method: "GET",
            url: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            responseType: "arraybuffer",
            headers: {
              Authorization: `Bearer ${auth.credentials.access_token}`,
            },
          });

          return Buffer.from(response.data, "binary").toString("base64");
        } catch (e) {
          throw e;
        }
      };

      resolve({ getFileMetadata, downloadFileAsBlob });
    });
  });
}

module.exports = initDrive;
