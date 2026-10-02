import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8180";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kiago_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("kiago_token");
      window.dispatchEvent(new Event("kiago:logout"));
    }
    return Promise.reject(error);
  },
);

export function extractData<T>(value: any): T {
  const d = value?.data ?? value;
  if (d && typeof d === "object" && "success" in d && "data" in d) {
    return (d as { data: T }).data;
  }
  return d as T;
}

export function getApiError(
  error: unknown,
  fallback = "Ocurrió un error. Intentá nuevamente.",
) {
  if (axios.isAxiosError(error)) {
    const details = error.response?.data?.errors;
    const detailMessage = Array.isArray(details)
      ? details
          .map((detail) => detail?.message || detail)
          .filter(Boolean)
          .join(" ")
      : "";
    return (
      detailMessage ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      fallback
    );
  }
  return fallback;
}
