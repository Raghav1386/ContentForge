const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const gethistory = async (token) => {
  const response = await fetch(`${API_URL}/generate/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to fetch history");
  }

  return result.data;
};