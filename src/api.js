import axios from "axios";

export default axios.create({
  withCredentials: true,
  baseURL: 'https://5c-back.vercel.app/',
  // baseURL: "http://localhost:3005",
});
