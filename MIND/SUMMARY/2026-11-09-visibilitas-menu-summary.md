# Visibilitas submenu publik (PM 22784e48) — branch nicoarya20/high-visibilitas-menu

Commits: 08b0da4f (db), 63a19b82 (menu publik + 404), b5c60307 (api), e86bc071 (admin).

## Migrasi
- `prisma/migrations/20261109120000_add_menu_visibility/migration.sql` — CREATE TABLE IF NOT EXISTS "MenuVisibility"
  (id, menuKey UNIQUE, isVisible, updatedById → users.id ON DELETE SET NULL, createdAt, updatedAt), FK dicek via pg_constraint.
- Murni additive, tanpa backfill: tabel kosong = perilaku default config. Base diff: `perbaikan/2026-11-09/high`.
- Schema: model `MenuVisibility` + relasi `User.menuVisibilityUpdates` (prisma format merapikan alignment blok User).

## Kontrak API (baru)
- `GET /api/menu-visibility/findMany` (publik, tidak perlu whitelist: GET non-admin sudah publik) →
  `{ success: true, data: { menuKey: string; isVisible: boolean }[] }` (dari cache tag).
- `PUT /api/menu-visibility/update` body `{ items: { menuKey: string; isVisible: boolean | null }[] }` (1..200; null = hapus override).
  401 tanpa sesi (guard global /api + requireAuth), 403 role selain "0"/"1", 400 menuKey bukan href submenu navbar / ganda / kosong.
  Sukses → `{ success: true, data: rows }`, error → `{ success: false, message }`. Simpan dalam satu $transaction lalu
  `revalidateTag("menu-visibility", { expire: 0 })`.
- `auth-policy.ts`: `ROLE_DEVELOPER`, `MENU_VISIBILITY_MANAGER_ROLES`, `canManageMenuVisibility()`.

## Mekanisme menu efektif, 404 & cache
- Logika murni: `src/app/darmasaba/_com/menu-visibility.logic.ts` (applyMenuOverrides, hiddenMenuHrefs, isPathHidden
  = pencocokan per segmen via isPathActive, effectiveMenuVisibility, menuVisibilityGroups, isKnownMenuKey, toOverrides).
- `src/lib/menu-visibility.server.ts`: `unstable_cache` + tag `menu-visibility` atas prisma.menuVisibility.findMany.
- `src/app/darmasaba/layout.tsx` kini server component: `await connection()` → baca override → `MenuVisibilityProvider`
  (React context) → `DarmasabaShell` (isi layout client lama, dipindah ke `_com/DarmasabaShell.tsx`) → `MenuVisibilityGuard`.
- Guard 404 = client component dengan `usePathname()` + `notFound()`: jalan saat SSR (URL langsung) dan saat navigasi
  client. Dipilih ketimbang header dari proxy karena (a) matcher proxy hanya /admin (kontrak proxy_matcher tetap), dan
  (b) layout server tidak dirender ulang saat soft navigation. notFound di layout tertangkap root `app/not-found.tsx`.
- Konsumen: Navbar (desktop/flyout/mobile via props), globalSearch (menu: `searchMenu(q, searchMenus)`; konten:
  `isSearchResultHidden` di searchUrl.tsx), Peta Informasi (`petaInformasiGroups(q, searchMenus)`).
  `DEFAULT_SEARCH_MENUS` = efektif tanpa override (search-extra-pages di bawah href tersembunyi dibuang).

## Tersembunyi secara default (tanpa row DB)
- Submenu (hilang dari navbar/pencarian/peta + 404 termasuk sub-path): Kesehatan › Data Kesehatan Warga, Puskesmas,
  Penanganan Darurat, Info Wabah/Penyakit.
- Halaman tambahan pencarian/peta: data-kesehatan-warga/{fasilitas-kesehatan-page, artikel-kesehatan-page,
  jadwal-kegiatan-page, grafik-penyakit}.
- Hasil konten globalSearch bertipe fasilitasKesehatan, dokterdanTenagaMedis, tarifDanLayanan, jadwalKegiatan,
  artikelKesehatan, puskesmas, penangananDarurat, infoWabahPenyakit.

## Trade-off
- Tanpa flicker: override ikut HTML SSR. Biayanya seluruh /darmasaba jadi dynamic render per request (sebelumnya shell
  prerender statis); query DB di-cache tag, jadi beban DB ≈ 1 query per perubahan pengaturan.
- Bila DB tak terjangkau saat cache kosong, layout publik error (tidak ada fallback diam-diam ke default).
- Status HTTP 404 saat SSR bergantung pada Next menangkap notFound sebelum shell di-flush (tidak ada loading.tsx di atas
  layout, jadi seharusnya 404) — belum diverifikasi di browser/build.
- Infinite scroll globalSearch: filter dilakukan di client, jadi satu halaman hasil API bisa tampil lebih sedikit.

## Admin
- `/admin/pengaturan/visibilitas-menu` (page + `_com/MenuVisibilityGroupCard.tsx` + `_state/pengaturan/menu-visibility-state.ts`).
  Switch per submenu langsung tersimpan; kembali ke nilai default = kirim null (row dihapus); tombol "Kembalikan semua ke default".
- Sidebar: `pengaturanMenu` di nav/domains.ts, TIDAK di navBar/devBar; `getNavbar` menambahkannya hanya untuk role 0/1.
  Halaman menampilkan "Akses ditolak" untuk role lain; backend tetap 403.
- `navigationByRole.ts` tidak dipakai di mana pun (dead code) — tidak disentuh, komentar salahnya tetap ada.

## Test
- Baru: menu_visibility_logic (14), menu_visibility_api (10), menu_visibility_ui (12).
- Disesuaikan (kontrak berubah karena keputusan "extras di bawah href tersembunyi disaring"): peta_informasi (expected
  href & grafik-penyakit tidak lagi tampil, regex `petaInformasiGroups(query, searchMenus)`), search_menu (preview pakai
  query "pemerintahan", regex `searchMenu(snap.query, searchMenus)`).
- 21 file test terkait lulus (293 test), tsc 0 error, eslint 0 error pada file yang diubah. Build tidak dijalankan.
