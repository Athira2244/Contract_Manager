import axios from "axios";

/**
 * Login / Auth API
 * ALWAYS goes to v1.mypayrollmaster.online
 */
export const authApi = axios.create({
  baseURL: "https://v1.mypayrollmaster.online/api/v2qa",
  withCredentials: true, // if cookies/session used
});

/**
 * Internal App API
 * Uses same domain (Apache proxy → localhost:9999)
 */
export const appApi = axios.create({
  baseURL: "https://spboottestapi.mypayrollmaster.online/api",
});
