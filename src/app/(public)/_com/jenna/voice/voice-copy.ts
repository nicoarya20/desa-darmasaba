// Teks UI mode suara widget publik (Bahasa Indonesia, sapaan "Anda" seperti widget chat).
export const VOICE_COPY = {
  start: "Bicara dengan {name}",
  stop: "Akhiri",
  stopLabel: "Akhiri mode suara",
  dismiss: "Tutup pesan",
  micLevel: "Level mikrofon",
  sessionLeft: "Sisa sesi {waktu}",
  todayLeft: "Sisa hari ini {menit}",
  status: {
    connecting: "Menyambungkan…",
    ready: "Siap bicara",
    listening: "Mendengarkan…",
    answering: "{name} berbicara…",
  },
  consent: {
    title: "Izinkan mikrofon",
    body:
      "Mode suara memakai mikrofon Anda. Ucapan Anda diproses layanan AI pihak ketiga untuk dijawab oleh {name}, " +
      "dan suara jawaban dihasilkan oleh AI. Transkrip disimpan tersamar seperti chat biasa. " +
      "Mode suara dibatasi kuota menit harian. Jangan sebutkan NIK, nomor KK, atau data pribadi.",
    accept: "Setuju dan mulai",
    decline: "Batal",
  },
  ended: {
    idle: "Mode suara diakhiri karena tidak ada percakapan.",
    maxDuration: "Batas waktu sesi suara tercapai. Anda bisa memulai sesi baru.",
    quota: "Jatah menit suara hari ini sudah habis. Silakan gunakan chat teks.",
    closed: "Sesi suara sudah berakhir.",
    hidden: "Mode suara diakhiri karena halaman ditinggalkan.",
  },
  errors: {
    micDenied: "Izin mikrofon ditolak. Aktifkan izin mikrofon di browser lalu coba lagi.",
    micMissing: "Mikrofon tidak ditemukan. Sambungkan mikrofon lalu coba lagi.",
    micBusy: "Mikrofon sedang dipakai aplikasi lain. Tutup aplikasi itu lalu coba lagi.",
    connectionLost: "Koneksi suara terputus. Periksa jaringan lalu coba lagi.",
    failed: "Mode suara gagal dimulai. Silakan coba lagi.",
  },
  commentary: {
    empty: "Maaf, suara Anda tidak terdengar jelas. Silakan ucapkan sekali lagi.",
    failed: "Maaf, saya sedang tidak bisa menjawab. Silakan coba lagi sebentar.",
  },
} as const;
