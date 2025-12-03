import axios from "axios";
export const base_url = "https://oms-turbulent-bilby-rp.cfapps.us10-001.hana.ondemand.com/api";
// export const base_url = "https://6gnvztgt-8080.inc1.devtunnels.ms/api"; //local

const api = axios.create({
  baseURL: base_url,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or use cookies/session
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Global response/error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {

    return Promise.reject(error);
  }
);

export default api;