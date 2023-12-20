const { google } = require("googleapis");
const axios = require("axios");

const dotenv = require("dotenv");
dotenv.config();

const email = "miliostation@milio-station.iam.gserviceaccount.com";
const key =
  "-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCrSdq0JeyEfkcX\n2IPXr+Fbbnv2RZlw/m7LrZ3OYFqVwaCUTy7w+0rX7xsUWR3WwF5rXDPdQleaQoGe\nAoNw2LNokGPM5n8WQFm2QjZasUEn/STHfEAdM7sdgtrz8HUB5UghSWrKublxvLwd\nsGwYD/dHAdkHH3eEjRPoRHMDfEA9VLParzdjSH7GHHRMTFmqMR6z2C7HBPIOHJeo\na7SqSw0lxRvtmUZ/yn2j3vqbUAmaAj86VfOgzsGlIWILgqKvrsNJyPTJgTUiHWNl\nmyEpuUlfs7cNJxADs1Su9mmXSv6Xl4+jYEUpt/cFJ5V5324VWCvhLYL7tmUlaORJ\nL/I3FIRxAgMBAAECgf9bkoo2ZCGbZD+DOXJu7pho8NRMCfJNzoxBCB22qiTMVRj/\ntVV9ow+4cxwP304u/Lqp1wJNLTNhpgk7tvAkZEL4tYg7bMnUCeKLLKXQvA0rBFbj\nIvP3sYQrVHGE77A9FWiMHIfGQ5YEA1VieEdRsGOUKK9ZxzsMkILwu08Z99evkDSh\nFCQGqUTm7JTpvUrbUEQKLbsVPuas87B9F99pyoC5gnrOgcmfMQn7rpWjHBZckTq7\nYXG76D4R2NYG+omngD9MUB/KW1bh4SVQ4QoiJvPcWpyqpV/pfIlUklamvrkhpGyy\nBpwI0nrEOrlPwLqfUN3hppHx6DcxXOdGTjgM8IUCgYEA1kUnRlA/JkRLjRp+01kr\nV+X9mybswoqfB7i7T3TNmFOORyT4uoS8x2EDvM+9s/TDfiYUgU4JPRLqTtoL3swp\n1rBnUBzAMqTApT6xhu17jHy24DTRLXYkPfUzSWdMtH6zgHeDbjrAcVqhsKQ54zo9\nghPuw/QundeGqNZ8907R1bsCgYEAzKXE7/m8bP8ZqDmFzbMGg9ZgASw7bq1eLXWc\nPY/GHHWRptk6fjHaXAWF4NWgAgK02DDZVi4wDRiYMc7NnypVDlJJYByJGnzjbjGS\ns372Xn/LQfDg/6FtOdVsipUJlfyZ8N6m/glg20C1B207jsxQccTsobqXqu5PL5zx\nVMyNNcMCgYEAp6kq5zEJiNbtyzaNQLFIYhobzFiz8DHp6G/bWXwLGANhlDfQzJnq\n4ZP/CbIAPZzrj30alGdMgVaYsySZHzfgERatcJlepwIVn/ejj/GpuC8qJdwORaVp\nDHYeMHS9J4rwyDg8RneAd/I0DPUkOrIqyOrx7LDX/ThVLS3QUO+C79sCgYAwt1F/\nUvLw+3UvH6pjgjeN0M1/2fi36xtdNP8hhIVDpxUqI9IR0mpJt6LcF96EPAKy6EYE\nhvA3XeB1EubN+fTPePUwpPpaTNqTE8f5ZMLfUgqfwui80b+/obe58aqbgstelJIq\nLS9aYjf18aHY53hK7PbrtRB/x0Ugb3rfleYTowKBgFsXxAjfOc4n80paVC9lN3J7\nhyN/uf55VQTC+W5T0SyVBL6lhNrYRPfmgxoPctv0PYCbyuICdD60T/O5EHbqApZh\nUM2UKORyI8a9dWuIm2KADfYWTfmsUDqcOxKMLA5IwY0EdCZMlqMiE/e5JvUnsk0P\nZP1KfLy1+zAAiCDj0s93\n-----END PRIVATE KEY-----\n";

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
