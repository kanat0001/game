export async function createOrGetUser({ id, name }) {
  const res = await fetch("/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      data?.detail?.[0]?.msg ||
      data?.message ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export async function updateGameScore({ userId, gameName, score }) {
  const res = await fetch(`/api/v1/users/${userId}/scores/${gameName}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      data?.detail?.[0]?.msg ||
      data?.message ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data; // User
}


export async function getUsers({ skip = 0, limit = 100 } = {}) {
  const res = await fetch(`/api/v1/users?skip=${skip}&limit=${limit}`);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      data?.detail?.[0]?.msg ||
      data?.message ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data; // array of users
}