import { getToken } from "@clerk/nextjs";

export const baseApiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

export function apiUrl(path: string) {
  return baseApiUrl ? `${baseApiUrl.replace(/\/$/, "")}${path}` : path;
}

export async function getApiKeys() {
  const token = await getToken();

  const res = await fetch(apiUrl(`/api-keys`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Failed to get API keys");

  return res.json();
}

export async function createApiKey() {
  const token = await getToken();
  const res = await fetch(apiUrl(`/api-keys`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({})
  });
  if (!res.ok) throw new Error("Failed to create API key");
  return res.json();
}

export async function revokeApiKey(keyId: string) {
  const token = await getToken();
  const res = await fetch(apiUrl(`/api-keys/${keyId}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  console.log({ res });

  if (!res.ok) throw new Error("Failed to revoke API key");
  return res.json();
}
