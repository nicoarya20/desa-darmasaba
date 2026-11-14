import { IconBrandWhatsapp, IconPhone } from '@tabler/icons-react';
import type { Ref } from 'react';
import s from './kontak-aksi.module.css';
import type { LowonganKontak } from './lowongan-detail.types';
import { LOWONGAN_DETAIL_TEXT as T } from './lowongan-detail.text';

type Props = {
  kontak: LowonganKontak | null;
  /** `inline`: kepala & penutup kartu; `bar`: bilah melayang (tombol lebih ringkas, rentang penuh di mobile). */
  variant: 'inline' | 'bar';
  /** Dipantau KontakBar (IntersectionObserver) untuk menentukan kapan bilah melayang tampil. */
  ref?: Ref<HTMLDivElement>;
};

/**
 * Aksi kontak pemberi kerja: WhatsApp (isi) + Telepon (garis). Nomor rumah/kantor (`waHref` null) → hanya Telepon (isi).
 * Tanpa kontak → teks "Kontak belum dicantumkan". Sengaja tanpa tombol Simpan (situs desa tidak punya akun pelamar).
 */
export function KontakAksi({ kontak, variant, ref }: Props) {
  if (!kontak) {
    return (
      <p ref={ref} className={s.kosong}>
        {T.kontakKosong}
      </p>
    );
  }

  return (
    <div ref={ref} className={s.aksi} data-variant={variant} role="group" aria-label={T.kontakLabel}>
      {kontak.waHref && (
        <a className={s.button} data-tone="fill" href={kontak.waHref} target="_blank" rel="noopener noreferrer">
          <IconBrandWhatsapp size={18} stroke={1.75} aria-hidden="true" />
          {T.whatsapp}
          <span className={s.srOnly}> {T.tabBaru}</span>
        </a>
      )}
      <a className={s.button} data-tone={kontak.waHref ? 'line' : 'fill'} href={kontak.telHref}>
        <IconPhone size={18} stroke={1.75} aria-hidden="true" />
        {T.telepon}
      </a>
    </div>
  );
}
