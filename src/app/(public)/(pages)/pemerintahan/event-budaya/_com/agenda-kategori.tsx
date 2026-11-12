'use client';
import { KATEGORI_EVENT_COLOR, KATEGORI_EVENT_LABEL, type KategoriEvent } from '@/lib/agenda-desa';
import { IconCheck } from '@tabler/icons-react';
import type { CSSProperties } from 'react';
import { varWarnaKategori } from './agenda.meta';
import { AGENDA_TEXT } from './agenda.text';
import s from './agenda-panel.module.css';

type Props = {
  tersedia: { kategori: KategoriEvent; jumlah: number }[];
  tersembunyi: string[];
  onToggle: (kategori: KategoriEvent) => void;
  tampilRerainan: boolean;
  onToggleRerainan: () => void;
};

/** Warna saklar "Rerainan Bali" = warna penanda rerainan (kunyit), bukan warna kategori agenda. */
const WARNA_BALI = { '--ev': '#e09a1a' } as CSSProperties;

/**
 * Legenda kategori ala daftar kalender Outlook: kotak warna + nama + jumlah acara tahun ini.
 * Klik menyembunyikan/menampilkan kategori itu. Hanya kategori yang punya acara yang ditampilkan;
 * bila cuma satu, legenda tetap tampil sebagai keterangan warna (tanpa tombol). Di bawahnya saklar
 * lapisan "Rerainan Bali" (selalu ada, juga saat belum ada agenda).
 */
export function AgendaKategori({ tersedia, tersembunyi, onToggle, tampilRerainan, onToggleRerainan }: Props) {
  const bisaSaring = tersedia.length > 1;

  return (
    <section className={s.legend} aria-label={AGENDA_TEXT.kategori.label}>
      <h2 className={s.legendTitle}>{AGENDA_TEXT.kategori.title}</h2>
      <ul className={s.legendList}>
        {tersedia.map(({ kategori, jumlah }) => {
          const aktif = !tersembunyi.includes(kategori);
          const isi = (
            <>
              <span className={s.legendBox} aria-hidden>
                {aktif && <IconCheck size={12} stroke={3} />}
              </span>
              <span className={s.legendName}>{KATEGORI_EVENT_LABEL[kategori]}</span>
              <span className={s.legendCount}>{jumlah}</span>
            </>
          );
          return (
            <li key={kategori} style={varWarnaKategori(KATEGORI_EVENT_COLOR[kategori])}>
              {bisaSaring ? (
                <button type="button" className={s.legendItem} aria-pressed={aktif} onClick={() => onToggle(kategori)}>
                  {isi}
                </button>
              ) : (
                <span className={s.legendItem} data-static>
                  {isi}
                </span>
              )}
            </li>
          );
        })}
        <li style={WARNA_BALI} className={s.legendBali}>
          <button type="button" className={s.legendItem} aria-pressed={tampilRerainan} onClick={onToggleRerainan}>
            <span className={s.legendBox} aria-hidden>
              {tampilRerainan && <IconCheck size={12} stroke={3} />}
            </span>
            <span className={s.legendName}>
              {AGENDA_TEXT.bali.legend}
              <span className={s.legendKet}>{AGENDA_TEXT.bali.legendKet}</span>
            </span>
          </button>
        </li>
      </ul>
    </section>
  );
}
