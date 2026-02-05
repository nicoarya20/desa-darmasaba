import { getValidAuthToken } from "../../src/lib/seafile-auth-service";

type CdnItem = {
  name: string;
  path: string;
  cdnUrl: string;
};

type DirItem = {
  type: "file" | "dir";
  name: string;
};

const BASE_URL = process.env.SEAFILE_BASE_URL!;
const REPO_ID = process.env.SEAFILE_REPO_ID!;

// folder yang dishare (RELATIVE, tanpa slash depan)
const DIR_TARGET = "asset-web";

// 🔑 TOKEN DIRECTORY SHARE (/d/{token})
const PUBLIC_SHARE_TOKEN = process.env.SEAFILE_PUBLIC_SHARE_TOKEN!;

/**
 * Ambil list file dari repo (butuh token sekali)
 */
async function getDirItems(): Promise<DirItem[]> {
  const token = await getValidAuthToken();

  const res = await fetch(
    `${BASE_URL}/api2/repos/${REPO_ID}/dir/?p=/${DIR_TARGET}`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed get dir items: ${text}`);
  }

  return res.json();
}

/**
 * Build PUBLIC CDN URL
 */
function buildPublicCdnUrl(fileName: string) {
  return `${BASE_URL}/d/${PUBLIC_SHARE_TOKEN}/files/?p=${encodeURIComponent(
    fileName,
  )}&raw=1`;
}

/**
 * Ambil semua PUBLIC CDN URL
 */
export async function getAllPublicCdnUrls(): Promise<CdnItem[]> {
  const items = await getDirItems();

  return items
    .filter((item) => item.type === "file")
    .map((file) => {
      const path = `${DIR_TARGET}/${file.name}`;
      return {
        name: file.name,
        path,
        cdnUrl: buildPublicCdnUrl(file.name),
      };
    });
}

/**
 * Run langsung (optional)
 */
if (import.meta.main) {
  const data = await getAllPublicCdnUrls();
  console.log(data);
}
