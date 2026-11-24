// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Source-check (bukan import): DetailBackLink & halaman detail menarik next-view-transitions yang tak bisa dimuat di env node.
const ROOT = path.resolve(__dirname, '../../src/app/(public)');
const PAGES = path.join(ROOT, '(pages)');
const read = (file: string) => readFileSync(file, 'utf8');

const COMPONENT = read(path.join(ROOT, '_com/detail-back-link/DetailBackLink.tsx'));

describe('DetailBackLink', () => {
  it('memakai gaya tautan kembali detail UMKM (.back) + link-reveal', () => {
    expect(COMPONENT).toMatch(/import back from '@\/app\/\(public\)\/\(pages\)\/ekonomi\/umkm\/_com\/detail-umkm\/detail-umkm\.module\.css'/);
    expect(COMPONENT).toContain('className={`${back.back} ${r.trigger}`}');
    expect(COMPONENT).toContain('<span className={r.cta} data-text={label}>');
  });

  it('chevron kiri dekoratif (aria-hidden) dengan kelas r.chevronBack', () => {
    expect(COMPONENT).toMatch(/<IconChevronLeft className=\{r\.chevronBack\}[^>]*aria-hidden[^>]*\/>/);
  });

  it('menaut ke href daftar lewat Link next-view-transitions, bukan router.back()', () => {
    expect(COMPONENT).toContain("import { Link } from 'next-view-transitions'");
    expect(COMPONENT).toContain('<Link href={href}');
    expect(COMPONENT).not.toContain('router.back');
  });
});

// Halaman DETAIL wajib tautan teks "‹ Nama Daftar"; tombol ikon panah BackButton hanya untuk halaman daftar/menu.
const DETAIL_FILES = [
  'ekonomi/lowongan-kerja-lokal/_com/detail/LowonganDetail.tsx',
  'inovasi/inovasi-teknologi-desa/_com/detail/InovasiDetail.tsx',
  'keamanan/keamanan-lingkungan-pecalang-patwal/_com/detail/KeamananLingkunganDetail.tsx',
  'keamanan/laporan-publik/_com/detail/LaporanDetail.tsx',
  'keamanan/pencegahan-kriminalitas/_com/detail/PencegahanDetail.tsx',
  'kesehatan/kontak-darurat/_com/detail/KontakDaruratDetail.tsx',
  'kesehatan/posyandu/_com/detail/PosyanduDetail.tsx',
  'kesehatan/program-kesehatan/_com/detail/ProgramDetail.tsx',
  'pendidikan/info-sekolah/_com/lembaga-detail/LembagaDetailPage.tsx',
  'pemerintahan/galery/video/[id]/page.tsx',
  'pemerintahan/kegiatan-desa/_com/detail/KegiatanDetail.tsx',
  'pemerintahan/layanan/_com/detail/LayananDetail.tsx',
  'pemerintahan/pengumuman/_com/detail/PengumumanDetail.tsx',
  'pemerintahan/potensi/[id]/page.tsx',
  // Cabang detail Berita ada di layout bersama daftar.
  'pemerintahan/berita/layout.tsx',
].map((rel) => path.join(PAGES, rel));

// Di luar (pages): bagan struktur organisasi (PPID + Perangkat Desa), detail prestasi dan kepala program DAK (route group (tambahan)).
// PPID ppid/_com/PpidPage.tsx sengaja TIDAK masuk: shell itu juga dipakai halaman daftar PPID yang tetap memakai panah.
DETAIL_FILES.push(
  path.join(ROOT, '_com/struktur-organisasi/StrukturDetailView.tsx'),
  path.join(ROOT, '(tambahan)/prestasi-desa/[id]/page.tsx'),
  path.join(ROOT, '(tambahan)/desa-anti-korupsi/_com/ProgramHeader.tsx'),
);

describe('Halaman detail tanpa tombol ikon kembali', () => {
  const CASES = DETAIL_FILES.map((file) => [path.relative(ROOT, file), file]);

  it.each(CASES)('%s tidak mengimpor BackButto', (_rel, file) => {
    expect(read(file)).not.toMatch(/BackButto/);
  });

  // Menangkap tombol panah buatan sendiri (mis. ActionIcon + IconArrowLeft di detail video lama), bukan hanya BackButton.
  it.each(CASES)('%s tidak memakai IconArrowLeft', (_rel, file) => {
    expect(read(file)).not.toMatch(/IconArrowLeft/);
  });
});
