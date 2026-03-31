import axios from "axios";

const api = axios.create({
  baseURL: "https://spboottest.mypayrollmaster.online/", // IMPORTANT
});

export default api;
