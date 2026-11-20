import type { PhoneInfo } from '@/app/(public)/_com/kontak-darurat/kontak-phone.logic';
import { Anchor, Button, Stack, Text } from '@mantine/core';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { LAYANAN_DETAIL_TEXT as T } from './layanan-detail.text';

type Props = {
  /** Tautan wa.me petugas; null = Kontak Desa belum punya nomor WhatsApp valid, tampilkan fallback. */
  waHref: string | null;
  /** Telepon kantor desa untuk fallback; null = tidak ada saran telepon. */
  telepon: Pick<PhoneInfo, 'display' | 'telHref'> | null;
  onClose: () => void;
};

/**
 * Isi modal setelah permohonan tersimpan: tautan biasa ke WhatsApp petugas (bukan window.open setelah await,
 * yang diblokir Safari iPhone) dan tombol tutup. Tanpa nomor WhatsApp: kabar bahwa permohonan sudah tercatat
 * (bukan gagal) plus saran telepon kantor desa bila ada.
 */
export function PermohonanTersimpan({ waHref, telepon, onClose }: Props) {
  return (
    <Stack gap="md" role="status">
      <Text fw={700} fz={20}>
        {T.tersimpanTitle}
      </Text>
      <Text>{waHref ? T.tersimpanText : T.tersimpanTextTanpaWa}</Text>
      {waHref ? (
        <Button
          component="a"
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          size="md"
          radius="xl"
          // Modal dirender di portal (di luar akar halaman): pakai token global, bukan variabel --brand halaman.
          bg="var(--c-brand-fill)"
        >
          {T.lanjutWa}
        </Button>
      ) : telepon ? (
        <Text>
          {T.hubungiKantor}{' '}
          <Anchor href={telepon.telHref} c="inherit" underline="never" className={r.trigger}>
            <span className={r.cta} data-text={telepon.display}>
              {telepon.display}
            </span>
          </Anchor>
          .
        </Text>
      ) : null}
      <Button variant="default" size="md" radius="xl" onClick={onClose}>
        {T.tutup}
      </Button>
    </Stack>
  );
}
