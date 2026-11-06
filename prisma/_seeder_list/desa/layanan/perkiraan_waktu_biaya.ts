// PERKIRAAN — verifikasi dengan Dokumen SP Kepbek 53/2022
//
// Estimasi waktu & biaya pelayanan di bawah ini BUKAN data resmi desa. Situs resmi desa
// sedang tidak bisa diakses saat nilai ini ditulis, jadi dipilih perkiraan konservatif untuk
// layanan administrasi desa di Bali. Wajib dikonfirmasi (atau diganti lewat admin) oleh
// pihak desa sebelum dianggap standar pelayanan. Tidak ada klaim "resmi" di UI.
//
// Hanya layanan yang beralasan diisi; sisanya dibiarkan tidak ada di peta ini (= NULL = badge
// tidak tampil): Telunjuk Sakti Desa (akta diproses Dukcapil, bukan desa) dan Penduduk
// Non-Permanent (prosedur tergantung kasus).

export interface PerkiraanWaktuBiaya {
  estimasiWaktu: string | null;
  biaya: number | null;
}

const SURAT_KETERANGAN_UMUM: PerkiraanWaktuBiaya = { estimasiWaktu: "1 hari kerja", biaya: 0 };

export const PERKIRAAN_WAKTU_BIAYA: Record<
  "suratKeterangan" | "perizinanBerusaha",
  Record<string, PerkiraanWaktuBiaya | undefined>
> = {
  // 11 surat keterangan umum: Beda Biodata Diri, Yatim Piatu, Domisili Organisasi, Penghasilan,
  // Tidak Mampu, Kelahiran, Usaha, Kematian, Tempat Usaha, Belum Kawin, Kelakuan Baik.
  suratKeterangan: {
    cmdxyb9zi0010vniiaeyi55ui: SURAT_KETERANGAN_UMUM,
    cmdxycqz40014vniidftrixvf: SURAT_KETERANGAN_UMUM,
    cmdwx3wph0003vnr74us2t7h7: SURAT_KETERANGAN_UMUM,
    cmdxxv3i80004vniidg1mrucc: SURAT_KETERANGAN_UMUM,
    cmdxxwp070008vnii9jbdcto7: SURAT_KETERANGAN_UMUM,
    cmdxxyfkl000cvnii1bxinnfi: SURAT_KETERANGAN_UMUM,
    cmdxy23pl000gvniihsg38aq4: SURAT_KETERANGAN_UMUM,
    cmdxy4mgt000kvniib1nemjem: SURAT_KETERANGAN_UMUM,
    cmdxy61a1000ovniif4ytb9hs: SURAT_KETERANGAN_UMUM,
    cmdxy754q000svniiiz8oqyo0: SURAT_KETERANGAN_UMUM,
    cmdxy8pi2000wvnii48fc1sxd: SURAT_KETERANGAN_UMUM,
  },
  // Pendaftaran NIB lewat OSS tidak dipungut biaya; lama proses tergantung OSS, jadi waktu dikosongkan.
  perizinanBerusaha: {
    edit: { estimasiWaktu: null, biaya: 0 },
  },
};

/**
 * Nilai yang disimpan seeder: data yang sudah diisi admin (non-null) tidak ditimpa perkiraan,
 * jadi menjalankan ulang seeder tidak menghapus koreksi dari admin.
 */
export function waktuBiayaUntukSeed(
  existing: Partial<PerkiraanWaktuBiaya> | null | undefined,
  perkiraan: PerkiraanWaktuBiaya | undefined
): PerkiraanWaktuBiaya {
  return {
    estimasiWaktu: existing?.estimasiWaktu ?? perkiraan?.estimasiWaktu ?? null,
    biaya: existing?.biaya ?? perkiraan?.biaya ?? null,
  };
}
