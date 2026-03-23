// import axios from "axios";
// import { BACK_END_LINK } from "../assets/js/global";

// export function getImageURL(image) {
//   return BACK_END_LINK + "/images/" + image;
// }
// const api = axios.create({
//   baseURL: BACK_END_LINK + "/api/",
// });
// export const loginApi = axios.create({
//   baseURL: BACK_END_LINK + "/api/",
// });

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       location.reload();
//     }
//     throw error;
//   }
// );

// export default api;


// export default api;

import axios from "axios";
import { BACK_END_LINK } from "../assets/js/global";

export function getImageURL(image) {
  return BACK_END_LINK + "/api/images/" + image;
}

const api = axios.create({
  baseURL: BACK_END_LINK + "/api/",
});

// Inject token before each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.withCredentials = false;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optionally clear token and redirect to login
      localStorage.removeItem("auth_token");
      location.reload();
    }
    return Promise.reject(error);
  }
);

export const loginApi = axios.create({
  baseURL: BACK_END_LINK + "/api/",
  headers:{
    Authorization : `Bearer ${localStorage.getItem("auth_token")}`
  }
});

export default api;