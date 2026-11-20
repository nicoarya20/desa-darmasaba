/** Teks admin Profil Desa > Kontak Desa (judul, label field, petunjuk, galat muat). */
export const KONTAK_DESA_ADMIN_TEXT = {
  title: 'Kontak Desa',
  lead: 'Kontak resmi kantor desa. Tampil otomatis di footer website dan halaman PPID.',
  namaKantor: 'Nama Kantor',
  alamat: 'Alamat',
  telepon: 'Telepon',
  teleponHint: 'Nomor telepon tetap atau seluler Indonesia; boleh memakai spasi, tanda kurung, atau tanda hubung.',
  email: 'Email',
  whatsapp: 'WhatsApp (opsional)',
  whatsappHint:
    'Nomor seluler Indonesia. Kosongkan bila desa belum memiliki nomor WhatsApp; barisnya baru tampil di footer dan halaman PPID setelah diisi.',
  jamLayanan: 'Jam Layanan (opsional)',
  jamLayananHint:
    'Teks bebas, mis. Senin–Jumat 07.30–15.30. Kosongkan bila belum ada; barisnya baru tampil di footer dan halaman PPID setelah diisi.',
  submit: 'Simpan',
  loadError: 'Gagal memuat kontak desa',
  retry: 'Coba Lagi',
} as const;
