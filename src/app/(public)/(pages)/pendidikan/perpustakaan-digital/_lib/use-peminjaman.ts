import { useState } from 'react';
import { kirimPeminjaman } from './peminjaman.source';
import {
  EMPTY_PEMINJAMAN,
  hariIniDesa,
  peminjamanErrors,
  toPeminjamanPayload,
  type PeminjamanField,
  type PeminjamanValues,
} from './peminjamanForm';

export type KirimStatus = 'idle' | 'sending' | 'sent' | 'error';

/**
 * State formulir pinjam untuk satu buku (dipasang ulang tiap modal dibuka → isian kosong lagi). Galat isian tampil
 * setelah isian ditinggalkan (blur) atau setelah tombol kirim ditekan; kiriman gagal tetap di formulir.
 */
export function usePeminjaman(bukuId: string) {
  const [hariIni] = useState(() => hariIniDesa());
  const [values, setValues] = useState<PeminjamanValues>(EMPTY_PEMINJAMAN);
  const [touched, setTouched] = useState<Partial<Record<PeminjamanField, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<KirimStatus>('idle');

  const allErrors = peminjamanErrors(values, hariIni);
  const errorOf = (field: PeminjamanField) => (attempted || touched[field] ? allErrors[field] : undefined);

  const set = (field: PeminjamanField, value: string) => setValues((prev) => ({ ...prev, [field]: value }));
  const blur = (field: PeminjamanField) => setTouched((prev) => ({ ...prev, [field]: true }));

  const submit = async () => {
    setAttempted(true);
    if (Object.keys(allErrors).length > 0 || status === 'sending') return;
    setStatus('sending');
    try {
      await kirimPeminjaman(toPeminjamanPayload(bukuId, values));
      setStatus('sent');
    } catch (error) {
      console.error('Gagal mengirim peminjaman buku:', error);
      setStatus('error');
    }
  };

  return { hariIni, values, set, blur, errorOf, submit, status };
}
