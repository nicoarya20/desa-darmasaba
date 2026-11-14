import type { ReactNode } from 'react';
import { MusikApp } from './_com/app/MusikApp';

/** Satu layout untuk Musik, Jelajahi, dan Playlist: sidebar, antrean, dan pemutar tidak dipasang ulang saat pindah menu. */
export default function MusikDesaLayout({ children }: { children: ReactNode }) {
  return <MusikApp>{children}</MusikApp>;
}
