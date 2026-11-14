# Jenna Publik: Asisten Chat di Website Desa

Tanggal: 2026-11-13 · Versi: rilis setelah 0.1.266 · Migrasi: `20261113170000_add_jenna_conversation` (additive: `JennaConversation`, `JennaMessage`) · Induk: `docs/decisions/2026-11-13-developer-menu-jenna.md`

## Konteks
Tahap 1 hanya menyediakan pengaturan Jenna (`JennaSettings`, `JennaProvider`) di `/dev/jenna`. Tahap ini menghadirkan Jenna di semua halaman publik `src/app/(public)`: pengunjung anonim bertanya, Jenna menjawab **hanya** dari data publik desa. Risikonya: spam, penyalahgunaan biaya provider berbayar, prompt injection, dan kebocoran PII. Endpoint find-many publik yang ada tidak bisa dijadikan sumber karena banyak yang tanpa `select` dan tanpa guard (mengembalikan NIK, alamat, no HP). Data publik desa kecil (±35–45K token), jadi retrieval canggih tidak diperlukan. Sumber port: Jenna di vanguard-js (analisis di `MIND/PLAN/jenna-public-chat-analysis-*.md`).

## Keputusan
- **Pengetahuan = snapshot DB allowlist + 4 tool read-only, tanpa embeddings.** Registry `src/lib/jenna/knowledge/sources.ts` bersifat *default deny*: hanya model + field yang tercantum yang boleh dibaca, `select` selalu eksplisit (tanpa `include`/`omit`) agar kolom baru di schema tidak ikut bocor, HTML di-strip. Snapshot (`knowledge/snapshot.ts`) dan daftar rute publik (`knowledge/sitemap.ts`) di-cache `unstable_cache` 30 menit dengan tag `jenna-knowledge` + `MENU_VISIBILITY_TAG`, jadi halaman yang disembunyikan lewat visibilitas menu ikut hilang dari pengetahuan. Tool (`src/lib/jenna/tools/`): `cari_konten`, `detail_konten`, `agenda`, `cek_kantor_buka`, timeout 20 detik per tool. Loop tool maks 6 iterasi, satu giliran maks 60 detik. Model yang sengaja tidak masuk dicatat di kepala `sources.ts`.
- **Kontak**: Jenna tidak menyebut email/WhatsApp/telepon kantor desa; cukup jam layanan, alamat umum, dan tautan halaman kontak/PPID. Kontak organisasi yang tercantum di data publik (kontak darurat, polsek, puskesmas) boleh disebut. Aturan ini ada di prompt (`src/lib/jenna/prompt.ts`) dan ditegakkan output guard.
- **Percakapan disimpan, tersamar, anonim.** Pesan disimpan setelah PII disamarkan; sesi dan IP hanya disimpan sebagai hash HMAC-SHA256 (`hashJennaIdentifier`, salt diturunkan dari `BETTER_AUTH_SECRET`). Percakapan tanpa aktivitas lebih dari `retentionDays` (diputuskan 30 hari; bawaan setelan 90) dihapus otomatis. Riwayat untuk provider diambil dari DB, kiriman klien tidak pernah dipakai sebagai riwayat. Hanya role 0 yang boleh melihat percakapan (halaman `/dev/jenna/percakapan` dikerjakan terpisah, lihat Konsekuensi).
- **Tanpa captcha di v1.** Pertahanan berlapis di bawah dianggap cukup; Turnstile ditambahkan bila spam muncul.
- **Streaming SSE.** `POST /api/jenna/chat` adalah Next Route Handler (`runtime = "nodejs"`), di luar Elysia, sehingga tidak menyentuh `PUBLIC_POST_PATHS` dan streaming lebih sederhana. Event: `meta`, `status`, `delta`, `done`, `error`, plus komentar `: ping` tiap 15 detik. Header `Cache-Control: no-cache, no-transform` dan `X-Accel-Buffering: no`. `GET /api/jenna/status` memberi tahu widget apakah ia boleh tampil.

### Lapisan anti-spam & abuse (urutan gerbang)
Di route (`src/app/api/jenna/chat/route.ts`, helper `_lib/http.ts`), sebelum service:
1. **Origin** wajib sama dengan origin publik (`publicOriginFromHeaders`) → 403 `forbidden_origin`.
2. **Body ketat**: hanya `application/json`, ≤ 8 KB (dicek dari `Content-Length` dan saat membaca stream), skema zod `.strict()` → 422 `invalid_input`.
3. **Honeypot** `website` terisi → respons SSE yang tampak sukses, tanpa provider, tanpa persist.

Di `prepareChatTurn` (`src/lib/jenna/chat/chat.service.ts`), dari yang murah ke yang mahal:
1. Saklar `enabled` dan kesiapan provider; `dailyTokensGlobal` = 0 dianggap **tidak siap** (Jenna tidak aktif) → 409.
2. Validasi input (karakter kontrol dibuang, ≤ `maxInputChars`) → 422.
3. **Satu giliran aktif per sesi** → 429 `busy`.
4. **Batas per menit**: per IP → per sesi (`rateLimitPerMinute`) → global (60/menit) → 429 `rate_limited`. Urutan ini sengaja: permintaan yang sudah ditolak per IP tidak ikut menghabiskan plafon global pengunjung lain.
5. **Kuota harian** `dailyMessagesUser` per sesi **dan** per IP sejak 00:00 WIB → 429 `quota_exceeded`.
6. **Budget token global harian** `dailyTokensGlobal` → 503 `budget_exhausted`.

Limiter per menit dan gerbang konkurensi ada di memori proses (`src/lib/rate-limit.ts`, asumsi 1 instance). Kuota harian dan budget token dihitung dari tabel `JennaMessage`, jadi tetap berlaku setelah restart. Giliran yang gagal atau dibatalkan klien tetap dicatat (`status = 'error'` + token parsial), sehingga spam batal tidak bisa melewati kuota maupun budget.

### Penanganan PII
- **Masking input** (`src/lib/jenna/pii.ts`): NIK/KK 16 digit, nomor telepon Indonesia, dan email disamarkan sebelum dikirim ke provider dan sebelum disimpan.
- **Output guard** (`src/lib/jenna/chat/output-guard.ts`, `guardOutput`): membuang sisa pembungkus tool dan HTML mentah, hanya tautan ke rute publik yang terlihat yang tetap jadi tautan (maks 8 sumber), dan PII disamarkan **kecuali** nilainya tercantum di snapshot atau hasil tool giliran itu (pengecualian kontak tepercaya).
- **Delta guard** (`createDeltaGuard`): potongan stream di-buffer sampai batas kalimat/baris lalu lewat `guardOutput`; nomor yang dipisah spasi tidak pernah terpotong. URL terlarang atau PII tak tepercaya tidak pernah terkirim, dan `done.text` menggantikan teks stream.
- **Contract test registry** (`__tests__/api/jenna_knowledge_registry.test.ts` + snapshot): daftar `Model.field` yang dibaca dikunci snapshot; field yang cocok pola PII ditolak kecuali tercantum eksplisit di `PII_EXCEPTIONS` (kontak organisasi); model yang ditolak keputusan user tidak boleh muncul; filter `deletedAt` divalidasi terhadap `Prisma.dmmf`.

## Alternatif yang ditolak
- **Memakai ulang endpoint find-many publik / `_lib/search/findMany.ts`**: banyak tanpa `select` dan guard internal, mengembalikan NIK/alamat/HP (balita, ibu hamil, beasiswa, pengaduan, permohonan), tidak konsisten `isActive`, dan mencocokkan tag HTML.
- **Captcha (Turnstile) sekarang**: butuh env baru di stack dan menambah friksi untuk pengunjung; lapisan di atas cukup untuk v1.
- **Embeddings/pgvector atau Postgres FTS**: pgvector tidak tersedia, FTS butuh kolom/index lewat migrasi, dan untuk ±40K token snapshot + `contains` pada kolom allowlist sudah cukup.

## Konsekuensi
- Migrasi `20261113170000_add_jenna_conversation` wajib ter-deploy (otomatis lewat entrypoint `prisma migrate deploy`). Tidak ada env baru.
- Setelah deploy, Jenna tetap mati sampai developer mengatur di `/dev/jenna`: provider (`/dev/jenna/provider`), `dailyTokensGlobal` > 0 dan retensi 30 hari (`/dev/jenna/batas`), lalu `enabled` (`/dev/jenna`). Langkah lengkap di `docs/DEPLOYMENT.md`.
- Cookie `jenna_sid` (path `/api/jenna`, 30 hari, HttpOnly, SameSite=Lax, Secure di production). Scheduler retensi hanya jalan di production (`src/instrumentation.ts`).
- Mengganti `BETTER_AUTH_SECRET` mengubah semua hash: kuota harian efektif ter-reset dan percakapan lama tidak lagi dikenali sebagai milik sesinya (pengunjung mulai percakapan baru).
- Bila suatu saat >1 instance, limiter per menit dan gerbang konkurensi berlaku per instance (batas efektif berlipat); kuota harian dan budget tetap global.
- Developer dapat melihat statistik serta daftar/detail percakapan tersamar dan menghapusnya di `/dev/jenna/percakapan` (API `/api/developer/jenna/{stats,conversations,conversations/:id}`), dikerjakan di tugas terpisah.

## Tindak lanjut
- Turnstile bila spam muncul (lihat `docs/BACKEND-TODO.md`).
- Adapter OpenAI-compatible mengirim `max_tokens`; model reasoning OpenAI (o1/gpt-5) menolaknya dan butuh `max_completion_tokens` (`docs/BACKEND-TODO.md`).
- Verifikasi SSE di stg (buffering reverse proxy) dan E2E widget desktop + mobile.
- Voice di luar scope tahap ini.
