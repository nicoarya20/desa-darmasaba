// Teks & tautan blok pengantar musyawarah di halaman Ajukan Ide Inovatif.

export const PENGANTAR_MUSYAWARAH_JUDUL = "Ide Anda Bisa Dibahas di Musyawarah Desa";

export const PENGANTAR_MUSYAWARAH_TEKS =
  "Ide Anda dapat dibawa ke Musyawarah Desa / Musrenbangdes untuk dibahas bersama warga.";

export type PengantarMusyawarahLink = { label: string; href: string };

/** Tautan ke Agenda & Kalender Desa dan Dokumen Perencanaan (rute publik yang sudah ada). */
export const PENGANTAR_MUSYAWARAH_LINKS: readonly PengantarMusyawarahLink[] = [
  { label: "Agenda & Kalender Desa", href: "/darmasaba/pemerintahan/event-budaya" },
  { label: "Dokumen Perencanaan", href: "/darmasaba/pemerintahan/monev-pembangunan" },
];
