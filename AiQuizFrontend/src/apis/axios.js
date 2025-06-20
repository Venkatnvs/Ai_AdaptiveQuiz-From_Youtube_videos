import axios from "axios";
import BASE_URL from "../constants/urls";
import Cookies from "js-cookie";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/CookiesConstants";

const AXIOS_INSTANCE = axios.create({
    baseURL: BASE_URL,
    // withCredentials: true,
});

// For requests to the fog server (Flask)
const FOG_AXIOS_INSTANCE = axios.create({
    baseURL: "http://localhost:5000/",
    // withCredentials: true,
});

AXIOS_INSTANCE.interceptors.request.use(
    (config) => {
        const token = Cookies.get(ACCESS_TOKEN);
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

FOG_AXIOS_INSTANCE.interceptors.request.use(
    (config) => {
        const token = Cookies.get(ACCESS_TOKEN);
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

AXIOS_INSTANCE.interceptors.response.use(
    (response) => response,
        async (error) => {
        const originalRequest = error.config;
        if (error.response) {
            if (
                error.response.status === 401 &&
                originalRequest.url === "/auth/token/refresh/"
            ) {
                // Redirect to login page if token refresh fails
                console.error("Token refresh failed");
                window.location.href = "/login/";
                return Promise.reject(error);
            }
    
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                const refreshToken = Cookies.get(REFRESH_TOKEN);
                if (refreshToken) {
                    try {
                        const response = await AXIOS_INSTANCE.post("/auth/token/refresh/", {
                        refresh: refreshToken,
                        });
                        Cookies.set(ACCESS_TOKEN, response.data.access);
                        Cookies.set(REFRESH_TOKEN, response.data.refresh);
                        AXIOS_INSTANCE.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
                        originalRequest.headers["Authorization"] = `Bearer ${response.data.access}`;
                        return AXIOS_INSTANCE(originalRequest);
                    } catch (refreshError) {
                        window.location.href = "/login/";
                        return Promise.reject(refreshError);
                    }
                }
            }
        }
        return Promise.reject(error);
        }
);

export default AXIOS_INSTANCE;
export { FOG_AXIOS_INSTANCE }; // Use this for fog server requests