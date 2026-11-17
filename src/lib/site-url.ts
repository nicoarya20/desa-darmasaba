/** URL absolut situs publik (metadataBase, sitemap.xml, robots.txt) dari NEXT_PUBLIC_BASE_URL. */
// Fallback stg dipertahankan apa adanya: build Docker menyalin `.env.example` (NEXT_PUBLIC_BASE_URL="/"), jadi
// tanpa fallback URL-nya tidak absolut. Domain prod lewat env = plan-seo Fase A no.1 (task terpisah).
export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_BASE_URL
    : "https://desa-darmasaba-stg.wibudev.com";
