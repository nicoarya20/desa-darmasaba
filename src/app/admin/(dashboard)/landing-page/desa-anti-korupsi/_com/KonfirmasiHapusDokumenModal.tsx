'use client';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';

/** Teks konfirmasi hapus massal: jumlah dokumen + catatan bahwa file asli tetap tersimpan. */
export function konfirmasiHapusDokumenText(count: number): string {
  return (
    `Hapus ${count} dokumen? Dokumen akan hilang dari folder setelah perubahan disimpan; ` +
    'file asli tetap tersimpan.'
  );
}

type Props = { opened: boolean; count: number; onConfirm: () => void; onClose: () => void };

/** Konfirmasi hapus beberapa dokumen dari draft (memakai `ModalKonfirmasiHapus` admin). */
export function KonfirmasiHapusDokumenModal({ opened, count, onConfirm, onClose }: Props) {
  return (
    <ModalKonfirmasiHapus opened={opened} onClose={onClose} onConfirm={onConfirm} text={konfirmasiHapusDokumenText(count)} />
  );
}
