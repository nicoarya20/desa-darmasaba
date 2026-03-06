type DirItem = {
  type: "file" | "dir";
  name: string;
  path: string;
  size?: number;
};

type FileDownload = {
  name: string;
  path: string;
  link: string;
};

const TOKEN = process.env.SEAFILE_TOKEN!;
const REPO_ID = process.env.SEAFILE_REPO_ID!;

// ⛔ PENTING: RELATIVE PATH (tanpa slash depan)
const DIR_TARGET = "asset-web";

const BASE_URL = "https://cld-dkr-makuro-seafile.wibudev.com/api2";

const headers = {
  Authorization: `Token ${TOKEN}`,
};

/**
 * Ambil list item di directory
 */
async function getDirItems(): Promise<DirItem[]> {
  const res = await fetch(
    `${BASE_URL}/repos/${REPO_ID}/dir/?p=${encodeURIComponent(DIR_TARGET)}`,
    { headers },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed get dir items: ${body}`);
  }

  return res.json();
}


/**
 * Ambil download URL file
 */
async function getDownloadUrl(filePath: string): Promise<string> {
  const res = await fetch(
    `${BASE_URL}/repos/${REPO_ID}/file/?p=${encodeURIComponent(filePath)}`,
    { headers },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed get file url: ${body}`);
  }

  const data = await res.json();
  return data.url;
}

/**
 * Ambil semua download URL dari folder image
 */
export async function getImageDownloadList(): Promise<FileDownload[]> {
  const items = await getDirItems();

  const files = items.filter((item) => item.type === "file");

  return Promise.all(
    files.map(async (file) => {
      const filePath = `${DIR_TARGET}/${file.name}`; // → /image/xxx.webp

      return {
        name: file.name,
        path: filePath,
        link: await getDownloadUrl(filePath),
      };
    }),
  );
}

