import axios from "axios";

const API_URL = "http://localhost:4000/api/me";

export async function getProfile(token: string) {
  const res = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function updateProfile(token: string, data: Record<string, unknown>) {
  const res = await axios.patch(API_URL, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
}