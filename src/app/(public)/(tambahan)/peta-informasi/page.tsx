import type { Metadata } from 'next';
import PetaInformasi from './_com/PetaInformasi';
import { PETA_INFORMASI_TEXT } from './_com/peta-informasi.text';

export const metadata: Metadata = {
  title: PETA_INFORMASI_TEXT.title,
  description: PETA_INFORMASI_TEXT.description,
};

/** Route publik /peta-informasi: daftar semua halaman website per menu utama. */
export default function Page() {
  return <PetaInformasi />;
}
