/**
 * Masa cache berkas statis public/ (di luar /api/img): audit PageSpeed "Use efficient cache lifetimes" menandai
 * font.otf, ikon, dan foto statis yang sebelumnya hanya 1 jam (Cloudflare menaikkan jadi 4 jam).
 *
 * Kenapa 30 hari dan bukan `immutable`: nama berkas statis ini tetap (tanpa hash), jadi berkas yang diganti
 * dengan nama sama baru terlihat setelah browser pengunjung kedaluwarsa (maks 30 hari + 1 hari SWR). Jika sebuah
 * berkas perlu langsung berganti, ganti NAMA berkasnya (bukan hanya isinya). Cloudflare meneruskan nilai
 * origin yang lebih besar dari default-nya, sama seperti /api/img.
 */
export const STATIC_CACHE_CONTROL = 'public, max-age=2592000, stale-while-revalidate=86400';

/**
 * Berkas statis di akar public/ (mis. /darmasaba-icon.png). Satu segmen saja `[^/]+`, jadi tidak mengenai
 * /api/*, /_next/*, /admin/*, atau berkas bersarang; /assets/* ditangani aturan terpisah di next.config.ts.
 */
export const ROOT_STATIC_FILE_SOURCE = '/:file([^/]+\\.(?:png|jpe?g|webp|svg|ico|otf|ttf|woff2?))';

export const STATIC_CACHE_HEADERS = [{ key: 'Cache-Control', value: STATIC_CACHE_CONTROL }];
