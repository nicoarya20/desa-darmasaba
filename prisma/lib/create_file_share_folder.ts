// import { getValidAuthToken } from "../../src/lib/seafile-auth-service";

// type CdnItem = {
//   name: string;
//   path: string;
//   cdnUrl: string;
// };

// type DirItem = {
//   type: "file" | "dir";
//   name: string;
// };

// const BASE_URL = process.env.SEAFILE_BASE_URL!;
// const REPO_ID = process.env.SEAFILE_REPO_ID!;

// // folder yang dishare (RELATIVE, tanpa slash depan)
// const DIR_TARGET = "asset-web";

// // 🔑 TOKEN DIRECTORY SHARE (/d/{token})
// const PUBLIC_SHARE_TOKEN = process.env.SEAFILE_PUBLIC_SHARE_TOKEN!;

// /**
//  * Ambil list file dari repo (butuh token sekali)
//  */
// async function getDirItems(): Promise<DirItem[]> {
//   const token = await getValidAuthToken();

//   // Validasi bahwa semua variabel lingkungan telah diatur
//   if (!BASE_URL) {
//     throw new Error('SEAFILE_BASE_URL environment variable is not set');
//   }

//   if (!REPO_ID) {
//     throw new Error('SEAFILE_REPO_ID environment variable is not set');
//   }

//   // Bangun URL dan pastikan valid
//   const url = `${BASE_URL}/api2/repos/${REPO_ID}/dir/?p=/${DIR_TARGET}`;

//   try {
//     new URL(url); // Ini akan melempar error jika URL tidak valid
//   } catch (error) {
//     throw new Error(`Invalid URL constructed: ${url}. Error: ${error}`);
//   }

//   const res = await fetch(url, {
//     headers: {
//       Authorization: `Token ${token}`,
//     },
//   });

//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`Failed get dir items: ${text}`);
//   }

//   return res.json();
// }

// /**
//  * Build PUBLIC CDN URL
//  */
// function buildPublicCdnUrl(fileName: string) {
//   return `${BASE_URL}/d/${PUBLIC_SHARE_TOKEN}/files/?p=${encodeURIComponent(
//     fileName,
//   )}&raw=1`;
// }

// /**
//  * Ambil semua PUBLIC CDN URL
//  */
// export async function getAllPublicCdnUrls(): Promise<CdnItem[]> {
//   const items = await getDirItems();

//   return items
//     .filter((item) => item.type === "file")
//     .map((file) => {
//       const path = `${DIR_TARGET}/${file.name}`;
//       return {
//         name: file.name,
//         path,
//         cdnUrl: buildPublicCdnUrl(file.name),
//       };
//     });
// }

// /**
//  * Run langsung (optional)
//  */
// if (import.meta.main) {
//   const data = await getAllPublicCdnUrls();
//   console.log(data);
// }



// import { getValidAuthToken } from "../../src/lib/seafile-auth-service";

// type CdnItem = {
//   name: string;
//   path: string;
//   cdnUrl: string;
// };

// type DirItem = {
//   type: "file" | "dir";
//   name: string;
// };

// // ✅ PAKAI ENV YANG BENAR
// const BASE_URL = process.env.SEAFILE_URL!;
// const REPO_ID = process.env.SEAFILE_REPO_ID!;
// const PUBLIC_SHARE_TOKEN = process.env.SEAFILE_PUBLIC_SHARE_TOKEN!;

// // folder yang dishare (RELATIVE, TANPA slash depan)
// const DIR_TARGET = "asset-web";

// /**
//  * Ambil list file dari repo (token dipakai SEKALI)
//  */
// async function getDirItems(): Promise<DirItem[]> {
//   if (!BASE_URL || !REPO_ID) {
//     throw new Error("SEAFILE env not configured correctly");
//   }

//   const token = await getValidAuthToken();

//   const url = `${BASE_URL}/api2/repos/${REPO_ID}/dir/?p=/${DIR_TARGET}`;

//   const res = await fetch(url, {
//     headers: {
//       Authorization: `Token ${token}`,
//     },
//   });

//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`Failed get dir items: ${text}`);
//   }

//   return res.json();
// }

// /**
//  * Build PUBLIC CDN URL (DIRECTORY SHARE)
//  */
// function buildPublicCdnUrl(fileName: string) {
//   const fullPath = `/${DIR_TARGET}/${fileName}`;
//   return `${BASE_URL}/d/${PUBLIC_SHARE_TOKEN}/files/?p=${encodeURIComponent(
//     fullPath,
//   )}&raw=1`;
// }

// /**
//  * Ambil semua PUBLIC CDN URL
//  */
// export async function getAllPublicCdnUrls(): Promise<CdnItem[]> {
//   const items = await getDirItems();

//   return items
//     .filter((item) => item.type === "file")
//     .map((file) => ({
//       name: file.name,
//       path: `${DIR_TARGET}/${file.name}`,
//       cdnUrl: buildPublicCdnUrl(file.name),
//     }));
// }

// /**
//  * Run langsung
//  */
// if (import.meta.main) {
//   const data = await getAllPublicCdnUrls();
//   console.log(data);
// }


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
const BASE_URL = "https://cld-dkr-makuro-seafile.wibudev.com";
const REPO_ID = process.env.SEAFILE_REPO_ID!;
// folder yang dishare (RELATIVE, tanpa slash depan)
const DIR_TARGET = "asset-web";
// 🔑 TOKEN DIRECTORY SHARE (/d/{token})
const PUBLIC_SHARE_TOKEN = "3a9a9ecb5e244f4da8ae";
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
    //   const path = `${DIR_TARGET}/${file.name}`;
    const path = `/${file.name}`;
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

