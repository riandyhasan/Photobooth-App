const dotenv = require("dotenv");
dotenv.config();

const axios = require("axios");
const baseUrl = process.env.BASE_URL;

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

async function updateStatusTransaction(data) {
  try {
    const response = await axios.patch(
      `${baseUrl}/api/public/transaction`,
      data
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

async function getPromoByCode(code) {
  try {
    const response = await axios.get(
      `${baseUrl}/api/admin/station/discount?code=${code}`
    );
    if (response.status == 200) {
      return response.data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

module.exports = {
  getTransactionDetail,
  getDiscountDetail,
  getPromoByCode,
  updateStatusTransaction,
};
