import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { sitemapPaths } from "@/app/(public)/_com/sitemap.logic";
import { getMenuVisibilityOverrides } from "@/lib/menu-visibility.server";
import { SITE_URL } from "@/lib/site-url";

/** sitemap.xml halaman statis situs publik (yang terlihat di menu); URL detail dari DB belum dimasukkan. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Per request, sama seperti layout publik: build Docker tidak punya akses DB dan visibilitas menu harus berlaku
  // tanpa deploy ulang. Query override di-cache via tag. Tanpa lastModified/priority: halaman statis tak punya
  // tanggal ubah yang jujur.
  await connection();
  const overrides = await getMenuVisibilityOverrides();
  return sitemapPaths(overrides).map((path) => ({ url: new URL(path, SITE_URL).toString() }));
}
