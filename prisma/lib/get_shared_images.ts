//ini code awal cari image by folder di seafile


type CdnItem = {
  name: string;
  path: string;
  cdnUrl: string;
};

const BASE_URL = "https://cld-dkr-makuro-seafile.wibudev.com";
const SHARE_ID = "3325e9db2c504ebf9584";

// https://cld-dkr-makuro-seafile.wibudev.com/d/3a9a9ecb5e244f4da8ae/
// https://cld-dkr-makuro-seafile.wibudev.com/d/3a9a9ecb5e244f4da8ae/files/?p=-M_tICRVz6ZxOfvkuHQgU-mobile.webp&raw=1


/**
 * Build CDN URL langsung (tanpa API, tanpa token)
 */
export function buildCdnUrl(filePath: string) {
  // filePath contoh: "banner/home.jpg"
  return `${BASE_URL}/f/${SHARE_ID}/${filePath}?raw=1`;
}

/**
 * Ambil daftar file dari PUBLIC SHARE (optional)
 * Tidak pakai token
 */
async function getPublicDirItems(path = "/"): Promise<any[]> {
  const res = await fetch(
    `${BASE_URL}/api/v2.1/share-links/${SHARE_ID}/dir/?p=${encodeURIComponent(
      path,
    )}`,
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed get public dir items: ${text}`);
  }

  return res.json();
}

/**
 * Ambil semua CDN URL dari folder public share
 */
export async function getAllCdnUrls(
  dirPath = "/",
): Promise<CdnItem[]> {
  const items = await getPublicDirItems(dirPath);

  return items
    .filter((item: any) => item.type === "file")
    .map((file: any) => {
      const filePath =
        dirPath === "/"
          ? file.name
          : `${dirPath.replace(/\/$/, "")}/${file.name}`;

      return {
        name: file.name,
        path: filePath,
        cdnUrl: buildCdnUrl(filePath),
      };
    });
}

if(import.meta.main) {
  const allCdnUrls = await getAllCdnUrls();
  console.log(allCdnUrls);
}
