'use client';
import { useEffect, useState } from 'react';
import { isBarVisible, letakDari, NAVBAR_OFFSET_PX, type LetakAksi } from './kontak-bar.logic';
import s from './kontak-aksi.module.css';
import { KontakAksi } from './KontakAksi';
import type { LowonganKontak } from './lowongan-detail.types';

type Props = {
  posisi: string;
  kontak: LowonganKontak;
  /** Aksi di kepala kartu dan di blok penutup; null sampai elemennya terpasang. */
  kepala: HTMLElement | null;
  penutup: HTMLElement | null;
};

/** Pantau letak satu elemen terhadap area pandang (dikurangi navbar di atas); belum terpasang → 'inside'. */
function useLetak(el: HTMLElement | null): LetakAksi {
  const [letak, setLetak] = useState<LetakAksi>('inside');
  useEffect(() => {
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setLetak(letakDari(entry)), {
      rootMargin: `-${NAVBAR_OFFSET_PX}px 0px 0px 0px`,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);
  return letak;
}

/**
 * Bilah kapsul melayang di bawah tengah (mobile: selebar layar + safe-area) berisi posisi ringkas + aksi kontak.
 * Tampil hanya setelah aksi kepala tergulir lewat dan sebelum aksi penutup terlihat (lihat kontak-bar.logic.ts).
 * Saat tersembunyi tetap di DOM untuk animasi, tetapi `inert` + `aria-hidden` agar tidak bisa difokus.
 */
export function KontakBar({ posisi, kontak, kepala, penutup }: Props) {
  const visible = isBarVisible(useLetak(kepala), useLetak(penutup));

  return (
    <div className={s.bar} data-visible={visible} aria-hidden={!visible} inert={!visible}>
      <p className={s.barPosisi}>{posisi}</p>
      <KontakAksi kontak={kontak} variant="bar" />
    </div>
  );
}
