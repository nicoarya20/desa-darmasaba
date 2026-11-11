'use client';

/**
 * Input "Estimasi Waktu" (teks) dan "Biaya (Rp)" (angka) untuk form admin pelayanan.
 * Controlled, nilai berupa string: kosong = belum diisi, "0" = Gratis.
 */

import {
  PELAYANAN_BIAYA_MAX_DIGITS,
  PELAYANAN_ESTIMASI_WAKTU_MAX_LENGTH,
  sanitizeBiayaInput,
} from '@/lib/pelayanan-waktu-biaya';
import { TextInput } from '@mantine/core';

interface LayananWaktuBiayaFieldsProps {
  estimasiWaktu: string;
  biaya: string;
  onEstimasiWaktuChange: (value: string) => void;
  onBiayaChange: (value: string) => void;
}

function LayananWaktuBiayaFields({
  estimasiWaktu,
  biaya,
  onEstimasiWaktuChange,
  onBiayaChange,
}: LayananWaktuBiayaFieldsProps) {
  return (
    <>
      <TextInput
        label="Estimasi Waktu"
        placeholder="Contoh: 1 hari kerja"
        description="Kosongkan jika belum diisi"
        maxLength={PELAYANAN_ESTIMASI_WAKTU_MAX_LENGTH}
        value={estimasiWaktu}
        onChange={(e) => onEstimasiWaktuChange(e.currentTarget.value)}
      />
      <TextInput
        label="Biaya (Rp)"
        placeholder="Contoh: 50000"
        description="Isi 0 untuk Gratis. Kosongkan jika belum diisi."
        inputMode="numeric"
        maxLength={PELAYANAN_BIAYA_MAX_DIGITS}
        value={biaya}
        onChange={(e) => onBiayaChange(sanitizeBiayaInput(e.currentTarget.value))}
      />
    </>
  );
}

export default LayananWaktuBiayaFields;
