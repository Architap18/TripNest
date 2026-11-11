export const API_URL = (
  import.meta.env.DEV
    ? import.meta.env.VITE_API_URL || "http://localhost:5001/api"
    : "/api"
).replace(/\/$/, "");

export const apiRequest = async (endpoint, options = {}) => {
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...options.headers,
  };

  // Let the browser set multipart/form-data for file uploads.
  if (!isFormData && options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};
