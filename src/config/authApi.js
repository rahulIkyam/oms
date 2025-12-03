import axios from "axios";

export const base_url = "https://oms-turbulent-bilby-rp.cfapps.us10-001.hana.ondemand.com/api";
// export const base_url = "https://6gnvztgt-8080.inc1.devtunnels.ms/api"; //local

const authApi = axios.create({
  baseURL: base_url,
  headers: {
    "Content-Type": "application/json",
  },
});

export default authApi;
