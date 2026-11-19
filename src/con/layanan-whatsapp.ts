/** Kontak WhatsApp petugas layanan desa: tujuan tindak lanjut setelah warga mengajukan permohonan surat keterangan. */
export const PETUGAS_LAYANAN_WA = {
  /** Nama petugas di UI (bukan "Jenna": itu chatbot AI, bukan petugas). */
  label: 'Petugas Layanan Desa',
  /** Format bebas; dinormalisasi ke "628…" oleh `normalizeWaNumber` saat membangun tautan wa.me. */
  nomor: '+62 896-7497-0658',
} as const;
