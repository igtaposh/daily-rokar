import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/v1/api";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

const token = localStorage.getItem("token");
if (token) {
  setAuthToken(token);
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response || {};

    if (status === 401 || status === 403) {
      setAuthToken(null);
      localStorage.removeItem("user");

      if (window.location.pathname === "/dashboard") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
