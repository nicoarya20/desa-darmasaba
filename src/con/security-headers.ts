/** Header keamanan HTTP yang dipasang di respons semua route (juknis lomba 8.5). */
export const SECURITY_HEADERS = [
  // Cegah browser menebak tipe konten (MIME sniffing) dari berkas unggahan.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // SAMEORIGIN, bukan DENY: situs sendiri menampilkan PDF di iframe (modal dokumen).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Kirim origin saja ke situs lain; path & query (bisa memuat id/filter) tidak bocor.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Mikrofon hanya untuk origin sendiri (Jenna voice); kamera & lokasi tidak dipakai.
  { key: 'Permissions-Policy', value: 'microphone=(self), camera=(), geolocation=()' },
  // 180 hari. Sengaja tanpa includeSubDomains/preload: subdomain lain (stg, layanan
  // terpisah) belum tentu HTTPS penuh, dan preload hampir tidak bisa dibatalkan.
  { key: 'Strict-Transport-Security', value: 'max-age=15552000' },
  // Sengaja longgar: hanya frame-ancestors/object-src/base-uri. Situs memuat iframe Google
  // Maps & YouTube, tile OpenStreetMap, gambar MinIO, dan HTML rich-text dari admin, jadi
  // script-src/img-src/frame-src/style-src/default-src/form-action akan merusak halaman;
  // nonce memaksa semua halaman dinamis (lebih lambat). Perketat hanya setelah dites di stg.
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
  },
];
