// @vitest-environment node
// Tujuan + teks tautan kembali "‹ Nama Daftar" di 8 halaman detail (Kesehatan, sekolah, PPID/Struktur, DAK, Prestasi):
// label = nama menu/daftar, href = konstanta/helper daftar yang sudah ada. Source-check untuk komponen yang menarik
// next-view-transitions (tak bisa dimuat di env node); konstanta teks/href diimpor langsung.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { KONTAK_TEXT } from '@/app/(public)/(pages)/kesehatan/kontak-darurat/_com/kontak-darurat.text';
import { KONTAK_LIST_HREF } from '@/app/(public)/(pages)/kesehatan/kontak-darurat/_com/kontak-darurat.meta';
import { POSYANDU_TEXT } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu.text';
import { posyanduTabHref } from '@/app/(public)/(pages)/kesehatan/posyandu/_com/posyandu.logic';
import { PROGRAM_DETAIL_TEXT } from '@/app/(public)/(pages)/kesehatan/program-kesehatan/_com/program.text';
import { programListHref } from '@/app/(public)/(pages)/kesehatan/program-kesehatan/_com/program.logic';
import { LEMBAGA_DETAIL_TEXT } from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/lembaga-detail/lembaga-detail.text';
import { PRESTASI_TEXT } from '@/app/(public)/_com/main-page/prestasi/prestasi.text';
import { PRESTASI_LIST_HREF } from '@/app/(public)/_com/main-page/prestasi/prestasi.meta';

const ROOT = path.resolve(__dirname, '../../src/app/(public)');
const src = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');

describe('teks + tujuan tautan kembali halaman detail', () => {
  it('Kesehatan: nama menu daftar, href daftar', () => {
    expect(KONTAK_TEXT.kembali).toBe('Kontak Darurat');
    expect(KONTAK_LIST_HREF).toBe('/kesehatan/kontak-darurat');
    expect(POSYANDU_TEXT.kembali).toBe('Posyandu');
    expect(posyanduTabHref('posyandu')).toBe('/kesehatan/posyandu?tab=posyandu');
    expect(PROGRAM_DETAIL_TEXT.kembali).toBe('Program Kesehatan');
    expect(programListHref()).toBe('/kesehatan/program-kesehatan');
  });

  it('Info Sekolah dan Prestasi', () => {
    expect(LEMBAGA_DETAIL_TEXT.kembali).toBe('Info Sekolah');
    expect(PRESTASI_TEXT.kembali).toBe('Prestasi dan Penghargaan');
    expect(PRESTASI_LIST_HREF).toBe('/prestasi-desa');
  });

  it.each([
    ['(pages)/kesehatan/kontak-darurat/_com/detail/KontakDaruratDetail.tsx', '<DetailBackLink href={KONTAK_LIST_HREF} label={T.kembali} />'],
    ['(pages)/kesehatan/posyandu/_com/detail/PosyanduDetail.tsx', '<DetailBackLink href={posyanduTabHref("posyandu")} label={T.kembali} />'],
    ['(pages)/kesehatan/program-kesehatan/_com/detail/ProgramDetail.tsx', '<DetailBackLink href={programListHref()} label={T.kembali} />'],
    ['(pages)/pendidikan/info-sekolah/_com/lembaga-detail/LembagaDetailPage.tsx', '<DetailBackLink href={LEMBAGA_LIST_HREF} label={T.kembali} />'],
    ['(pages)/ppid/daftar-informasi-publik/[id]/page.tsx', 'backLink={{ href: DAFTAR_LIST_HREF, label: DAFTAR_TEXT.title }}'],
    ['(tambahan)/desa-anti-korupsi/_com/ProgramHeader.tsx', '<DetailBackLink href={kembali.href} label={kembali.label} />'],
    ['(tambahan)/prestasi-desa/[id]/page.tsx', '<DetailBackLink href={PRESTASI_LIST_HREF} label={PRESTASI_TEXT.kembali} />'],
  ])('%s memakai DetailBackLink ke daftarnya', (rel, usage) => {
    const code = src(rel);
    expect(code).toContain(usage);
    expect(code).not.toMatch(/BackButto|IconArrowLeft/);
  });

  it('sekolah: tautan atas dan tautan "tidak ditemukan" menuju daftar sekolah yang sama', () => {
    const code = src('(pages)/pendidikan/info-sekolah/_com/lembaga-detail/LembagaDetailPage.tsx');
    expect(code).toContain('const LEMBAGA_LIST_HREF = `${INFO_SEKOLAH_PATH}#${LEMBAGA_ANCHOR}`;');
    expect(code.match(/href=\{LEMBAGA_LIST_HREF\}/g)).toHaveLength(2);
  });

  it('kerangka PPID: halaman daftar tetap tombol ikon panah, hanya backLink yang menggantinya', () => {
    const shell = src('(pages)/ppid/_com/PpidPage.tsx');
    expect(shell).toContain('{backLink ? <DetailBackLink href={backLink.href} label={backLink.label} /> : <BackButton />}');
    expect(src('(pages)/ppid/daftar-informasi-publik/page.tsx')).not.toContain('backLink');
  });
});
