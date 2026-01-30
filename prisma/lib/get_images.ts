type DirItem = {
  type: "file" | "dir";
  name: string;
  path: string;
  size?: number;
};

const TOKEN = process.env.SEAFILE_TOKEN!;
const REPO_ID = process.env.SEAFILE_REPO_ID!;

// ⛔ PENTING: RELATIVE PATH (tanpa slash depan)
const DIR_TARGET = "asset-web";

const BASE_URL = process.env.SEAFILE_URL;

const headers = {
  Authorization: `Token ${TOKEN}`,
};

async function getDirItems(): Promise<DirItem[]> {
  const res = await fetch(`${BASE_URL}/repos/${REPO_ID}/dir/?p=${DIR_TARGET}`, {
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed get dir items: ${res.statusText}`);
  }

  return res.json();
}

async function getDownloadUrl(filePath: string): Promise<string> {
  const res = await fetch(
    `${BASE_URL}/repos/${REPO_ID}/file/?p=${encodeURIComponent(filePath)}&reuse=1`,
    { headers },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Seafile error:", {
      status: res.status,
      body: text,
      url: res.url,
    });
    throw new Error(`Failed get file url`);
  }

  const data = await res.json();

  return data;
}

/**
 * Ambil semua download URL dari target dir
 */
export async function getAllDownloadUrls() {
  const items = await getDirItems();

  const files = items.filter((item) => item.type === "file");

  const results = await Promise.all(
    files.map(async (file) => {
      const filePath = `${DIR_TARGET}/${file.name}`;
      const url = await getDownloadUrl(filePath);
      return {
        name: file.name,
        path: filePath,
        downloadUrl: url,
      };
    }),
  );

  return results;
}
