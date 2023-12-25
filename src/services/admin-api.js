const axios = require("axios");

const dotenv = require("dotenv");
dotenv.config();

const baseUrl = "https://api-app.miliostation.com";
const apiKey = "QM2E7gyCOFmmqda0crgMmhZSbEeDBDVw";

const headers = {
  "milio-x-key": apiKey,
};

async function checkStationName(name) {
  try {
    const response = await axios.get(`${baseUrl}/station/check/${name}`, {
      headers: headers,
    });
    if (response.status == 200) {
      return response.data;
    }
    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getStationById(id) {
  try {
    const response = await axios.get(`${baseUrl}/station/${id}`, {
      headers: headers,
    });
    if (response.status == 200) {
      return response.data;
    }
    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function createStation(data) {
  try {
    const response = await axios.post(`${baseUrl}/station`, data, {
      headers: headers,
    });
    if (response.status == 201) {
      return response.data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function openStation(id) {
  try {
    const response = await axios.put(`${baseUrl}/station/open/${id}`, null, {
      headers: headers,
    });
    if (response.status == 200) {
      return response.data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function closeStation(id) {
  try {
    const response = await axios.put(`${baseUrl}/station/close/${id}`, null, {
      headers: headers,
    });
    if (response.status == 200) {
      return response.data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function printPaper(id) {
  try {
    const response = await axios.put(`${baseUrl}/station/print/${id}`, null, {
      headers: headers,
    });
    if (response.status == 200) {
      return response.data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

module.exports = {
  checkStationName,
  createStation,
  openStation,
  closeStation,
  printPaper,
  getStationById
};
