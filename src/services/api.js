const axios = require("axios");
const baseUrl = "https://api.miliostation.com";

async function getTransactionDetail(id) {
  try {
    const response = await axios.get(
      `${baseUrl}/api/public/checkout?transaction=${id}`
    );
    if (response.status == 200) {
      return response.data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function getDiscountDetail(id) {
  try {
    const response = await axios.get(
      `${baseUrl}/api/admin/station/discount?id=${id}`
    );
    if (response.status == 200) {
      return response.data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

module.exports = { getTransactionDetail, getDiscountDetail };
