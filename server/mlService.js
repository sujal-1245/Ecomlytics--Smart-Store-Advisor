import axios from "axios";

const ML_URL = "http://localhost:8000";

export const getForecast = async (revenue) => {

  const res = await axios.post(
    `${ML_URL}/forecast`,
    { revenue }
  );

  return res.data;
};

export const getAnomalies = async (revenue) => {

  const res = await axios.post(
    `${ML_URL}/anomalies`,
    { revenue }
  );

  return res.data;
};

export const getClusters = async (products) => {

  const res = await axios.post(
    `${ML_URL}/cluster-products`,
    { products }
  );

  return res.data;
};