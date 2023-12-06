const axios = require("axios");
const QRCode = require("qrcode");

const mID = env.process.MID;
const apikey = env.process.API_KEY;

async function createInvoice(cliTrxNumber, cliTrxAmount) {
  try {
    const params = new URLSearchParams({
      do: "create-invoice",
      apikey,
      mID,
      cliTrxNumber: cliTrxNumber,
      cliTrxAmount: cliTrxAmount,
    });

    const response = await axios.get(
      `https://qris.online/restapi/qris/show_qris.php?${params}`
    );
    if (response.data.status == "success") {
      return response.data.data;
    }
    throw new Error(response.data.data.qris_status);
  } catch (error) {
    console.error("Error making the request:", error);
    throw error;
  }
}

async function generateQR(data) {
  try {
    // 'data' is the string you want to encode
    const qrCodeDataURL = await QRCode.toDataURL(data);
    // This data URL can be used as the src attribute of an image or saved to a file
    return qrCodeDataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

async function checkStatus(invId, trxValue, trxDate) {
  try {
    const params = new URLSearchParams({
      do: "checkStatus",
      invid: invId,
      apikey,
      mID,
      trxvalue: trxValue,
      trxdate: trxDate,
    });

    // Perform the GET request
    const response = await axios.get(
      `https://qris.online/restapi/qris/checkpaid_qris.php?${params}`
    );
    return response.data;
  } catch (error) {
    console.error("Error checking QRIS status:", error);
    throw error;
  }
}

module.exports = { createInvoice, generateQR, checkStatus };
