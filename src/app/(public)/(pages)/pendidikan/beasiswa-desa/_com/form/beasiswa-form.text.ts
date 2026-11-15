/** Teks modal formulir pendaftaran beasiswa. */
export const BEASISWA_FORM_TEXT = {
  title: 'Formulir Pendaftaran Beasiswa',
  privacy:
    'Data di formulir ini dipakai pemerintah desa untuk seleksi beasiswa dan untuk menghubungi Anda lewat nomor HP. Pastikan NIK dan nomor HP benar, dan isi hanya data yang diminta.',
  siswa: 'Data siswa',
  ortu: 'Data orang tua / wali',
  jenisKelamin: 'Jenis kelamin',
  jenisKelaminPlaceholder: 'Pilih jenis kelamin',
  jenisKelaminOptions: [
    { value: 'LAKI_LAKI', label: 'Laki-laki' },
    { value: 'PEREMPUAN', label: 'Perempuan' },
  ],
  tanggalLahir: 'Tanggal lahir',
  cancel: 'Batal',
  submit: 'Kirim Pendaftaran',
  sent: 'Pendaftaran terkirim. Petugas desa akan menghubungi lewat nomor HP yang Anda isi.',
} as const;
