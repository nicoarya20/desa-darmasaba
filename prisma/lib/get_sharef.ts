const BASE_URL = "https://cld-dkr-makuro-seafile.wibudev.com";
const ADMIN_TOKEN = process.env.SEAFILE_TOKEN!;
const REPO_ID = process.env.SEAFILE_REPO_ID!;

export async function createFileShareForFolder() {
  const res = await fetch(`${BASE_URL}/api/v2.1/share-links/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${ADMIN_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repo_id: REPO_ID,
      path: "/asset-web", // FOLDER
      permission: "r",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  const data = await res.json();
  console.log("FILE SHARE LINK:", data);

  // data.link -> https://domain/f/XXXX/
  // data.token / data.id (tergantung versi)
}

if (import.meta.main) {
  await createFileShareForFolder();
}
