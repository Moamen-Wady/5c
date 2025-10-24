import axios from "axios";

export default axios.create({
  withCredentials: true,
  baseURL: "https://5c-back.vercel.app/",
  // baseURL: "http://localhost:3005",
  timeout: 10000,
});

// export const isCancel = (err?: any) => axios.isCancel(err);
export const isCancel = (err: unknown): boolean =>
  axios.isAxiosError(err) && axios.isCancel(err);
