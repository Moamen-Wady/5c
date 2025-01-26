import axios from "axios";

export default axios.create({
  withCredentials: true,
  // baseURL: 'https://c5-q7vu.onrender.com',
  baseURL: "http://localhost:3005",
});
