import type { Lowongan } from '../lowongan.types';

/** Teks kaya siap render: HTML sudah disanitasi, atau paragraf teks polos (dirender React, tanpa innerHTML). */
export type RichText = { kind: 'html'; html: string } | { kind: 'text'; paragraphs: string[] };

/** Kontak pemberi kerja yang siap dipakai tombol Telepon/WhatsApp. */
export type LowonganKontak = {
  /** Nomor tampil (phoneInfo.display). */
  display: string;
  /** tel:+62... */
  telHref: string;
  /** wa.me dengan pesan pembuka; null bila bukan nomor seluler. */
  waHref: string | null;
};

/** Satu lowongan untuk halaman detail publik: bentuk daftar + teks kaya, kontak, dan tautan peta. */
export type LowonganDetail = Lowongan & {
  deskripsi: RichText | null;
  kualifikasi: RichText | null;
  kontak: LowonganKontak | null;
  /** Google Maps search dari `lokasi`; null bila lokasi kosong. */
  petaHref: string | null;
};

/** Status muat halaman detail. `notFound` juga mencakup lowongan nonaktif/terhapus. */
export type LowonganDetailState =
  | { status: 'loading' }
  | { status: 'ready'; data: LowonganDetail }
  | { status: 'notFound' }
  | { status: 'error' };
