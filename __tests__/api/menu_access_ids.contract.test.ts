// @vitest-environment node
// CONTRACT TEST — ALARM KEBAKARAN (AI-CONTRACT §10).
// ID section & submenu di bawah ini tersimpan di tabel UserMenuAccess (menuId).
// Mengubah/menghapus ID = Menu Access user yang sudah tersimpan diam-diam hilang.
// JANGAN update snapshot ini tanpa migrasi data UserMenuAccess + update docs + bump versi.
// Menambah submenu baru (ID baru) boleh: tambahkan di snapshot pada commit yang sama.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { navBar, pengaturanMenu } from '@/app/admin/_com/list_PageAdmin';
import { isUnderPath } from '@/app/admin/_com/nav/menu-access.logic';

const ALL_SECTIONS = [...navBar, pengaturanMenu];
const SUBMENUS = ALL_SECTIONS.flatMap((s) => s.children ?? []);

const EXPECTED_IDS: Record<string, string[]> = {
  'Landing Page': [
    'landing-page.profil',
    'landing-page.desa-anti-korupsi',
    'landing-page.sdgs',
    'landing-page.apbdes',
    'landing-page.prestasi-desa',
  ],
  'PPID': [
    'ppid.profil-ppid',
    'ppid.struktur-ppid',
    'ppid.visi-misi-ppid',
    'ppid.dasar-hukum',
    'ppid.permohonan-informasi-publik',
    'ppid.permohonan-keberatan-informasi-publik',
    'ppid.daftar-informasi-publik',
    'ppid.indeks-kepuasan-masyarakat',
  ],
  'Desa': [
    'desa.profil',
    'desa.potensi',
    'desa.berita',
    'desa.pengumuman',
    'desa.gallery',
    'desa.layanan',
    'desa.kegiatan-desa',
    // 2026-11-18: tab Dokumen Perencanaan di Kegiatan Desa jadi submenu sendiri (ID baru, aditif). Pemegang
    // 'desa.kegiatan-desa' diberi ID ini oleh migrasi 20261118120000_lomba_laporan_penduduk_bulanan.
    'desa.dokumen-perencanaan',
    'desa.event-budaya',
    'desa.banjar',
    'desa.struktur-perangkat-desa',
  ],
  'Kesehatan': [
    'kesehatan.posyandu',
    'kesehatan.data-kesehatan-warga',
    'kesehatan.puskesmas',
    'kesehatan.program-kesehatan',
    'kesehatan.penanganan-darurat',
    'kesehatan.kontak-darurat',
    'kesehatan.info-wabah-penyakit',
  ],
  'Keamanan': [
    'keamanan.keamanan-lingkungan-pecalang-patwal',
    'keamanan.polsek-terdekat',
    'keamanan.kontak-darurat',
    'keamanan.pencegahan-kriminalitas',
    'keamanan.laporan-publik',
    'keamanan.tips-keamanan',
    'keamanan.cctv',
  ],
  'Ekonomi': [
    'ekonomi.umkm',
    'ekonomi.lowongan-kerja-lokal',
    'ekonomi.bumdes',
    'ekonomi.padesa',
    'ekonomi.jumlah-pengangguran',
    'ekonomi.jumlah-penduduk-usia-kerja-yang-menganggur',
    'ekonomi.jumlah-penduduk-miskin',
    'ekonomi.program-kemiskinan',
    'ekonomi.sektor-unggulan-desa',
    'ekonomi.demografi-pekerjaan',
    'ekonomi.kesejahteraan-masyarakat',
  ],
  'Inovasi': [
    'inovasi.desa-digital-smart-village',
    'inovasi.layanan-online-desa',
    'inovasi.program-kreatif-desa',
    'inovasi.kolaborasi-inovasi',
    // 2026-11-16: 'inovasi.info-teknologi-tepat-guna' dihapus — digabung ke 'inovasi.desa-digital-smart-village'
    // (kini bernama Inovasi Teknologi Desa). Data UserMenuAccess dimigrasi di
    // prisma/migrations/20261116120000_inovasi_teknologi_desa; docs/decisions/2026-11-16-inovasi-teknologi-desa.md.
    'inovasi.ajukan-ide-inovatif',
  ],
  'Lingkungan': [
    'lingkungan.pengelolaan-sampah-bank-sampah',
    'lingkungan.program-penghijauan',
    'lingkungan.data-lingkungan-desa',
    'lingkungan.edukasi-lingkungan',
    'lingkungan.konservasi-adat-bali',
  ],
  'Pendidikan': [
    'pendidikan.info-sekolah',
    'pendidikan.beasiswa-desa',
    'pendidikan.program-pendidikan-anak',
    'pendidikan.bimbingan-belajar-desa',
    'pendidikan.pendidikan-non-formal',
    'pendidikan.perpustakaan-digital',
    'pendidikan.data-pendidikan',
  ],
  'Kependudukan': [
    'kependudukan.distribusi-agama',
    'kependudukan.distribusi-umur',
    'kependudukan.data-banjar',
    'kependudukan.laporan-bulanan',
    'kependudukan.migrasi-penduduk',
    'kependudukan.dinamika-penduduk',
  ],
  'Musik': [],
  'User & Role': [
    'user-role.user',
    'user-role.role',
  ],
  // 2026-11-12: Menu Access pindah dari User & Role ke Pengaturan (user-role.menu-access →
  // pengaturan.menu-access). Aman tanpa migrasi data: kedua section khusus role 0/1 dan tidak
  // pernah bisa disimpan di UserMenuAccess (dibuang withoutRestrictedSections).
  'Pengaturan': [
    'pengaturan.visibilitas-menu',
    'pengaturan.menu-access',
    // 2026-11-13: submenu Sampah (ditambahkan di 0.1.256 yang belum dirilis) dihapus lagi — Sampah kini panel per
    // fitur koleksi, bukan menu global. Aman tanpa migrasi data: section Pengaturan khusus role 0/1 sehingga ID-nya
    // tidak pernah tersimpan di UserMenuAccess (dibuang withoutRestrictedSections).
  ],
}; // test-only

// ID yang sudah dihapus → folder migrasi data UserMenuAccess yang memindahkan pemegangnya.
// Jangan dipakai ulang untuk menu lain (baris lama di DB bisa saja tertinggal di backup/restore).
const RETIRED_IDS: Record<string, string> = {
  // Gotong Royong kini kategori di Kegiatan Desa → pemegang dipindah ke 'desa.kegiatan-desa'.
  'lingkungan.gotong-royong': '20261116100000_kategori_gotong_royong',
}; // test-only

describe('kontrak ID Menu Access', () => {
  it('ID section & submenu sama persis dengan snapshot (urutan tampilan ikut dijaga)', () => {
    const actual = Object.fromEntries(ALL_SECTIONS.map((s) => [s.id, (s.children ?? []).map((c) => c.id)]));
    expect(actual).toEqual(EXPECTED_IDS);
    expect(ALL_SECTIONS.map((s) => s.id)).toEqual(Object.keys(EXPECTED_IDS));
  });

  it('ID pensiun tidak dipakai lagi dan punya migrasi data UserMenuAccess', () => {
    const ids = new Set([...ALL_SECTIONS.map((s) => s.id), ...SUBMENUS.map((c) => c.id)]);
    for (const [id, migration] of Object.entries(RETIRED_IDS)) {
      expect(ids.has(id), id).toBe(false);
      const sql = readFileSync(join(process.cwd(), 'prisma/migrations', migration, 'migration.sql'), 'utf8');
      expect(sql, migration).toContain('"UserMenuAccess"');
      expect(sql, migration).toContain(`'${id}'`);
    }
  });

  it('semua ID (section + submenu) unik', () => {
    const ids = [...ALL_SECTIONS.map((s) => s.id), ...SUBMENUS.map((c) => c.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ID submenu berformat slug <section>.<submenu>', () => {
    const invalid = SUBMENUS.map((c) => c.id).filter((id) => !/^[a-z0-9-]+\.[a-z0-9-]+$/.test(id));
    expect(invalid).toEqual([]);
  });

  it('slug section konsisten dalam satu section', () => {
    for (const section of ALL_SECTIONS) {
      const prefixes = new Set((section.children ?? []).map((c) => c.id.split('.')[0]));
      expect(prefixes.size, section.id).toBeLessThanOrEqual(1);
    }
  });

  it('setiap submenu punya basePath yang merupakan prefix (per segmen) dari path-nya', () => {
    for (const child of SUBMENUS) {
      expect(child.basePath, child.id).toMatch(/^\/admin\/[^/]+/);
      expect(isUnderPath(child.path, child.basePath), child.id).toBe(true);
    }
  });

  it('basePath antar submenu tidak tumpang tindih', () => {
    const bases = SUBMENUS.map((c) => c.basePath);
    const overlaps = bases.flatMap((a, i) =>
      bases.filter((b, j) => i !== j && isUnderPath(b, a)).map((b) => `${a} ⊃ ${b}`),
    );
    expect(overlaps).toEqual([]);
  });
});
