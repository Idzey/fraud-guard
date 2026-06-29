import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
};

if (baseURL.includes("ngrok")) {
  defaultHeaders["ngrok-skip-browser-warning"] = "true";
}

export const apiClient = axios.create({
  baseURL,
  timeout: 300_000,
  headers: defaultHeaders,
});

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    return axiosError.response?.data?.detail ?? axiosError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Неизвестная ошибка";
}
