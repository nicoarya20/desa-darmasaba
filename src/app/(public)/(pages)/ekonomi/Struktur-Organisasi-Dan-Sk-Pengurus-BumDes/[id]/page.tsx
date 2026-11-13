'use client';
import { StrukturDetail } from '@/app/(public)/_com/struktur-organisasi/StrukturDetail';
import { useParams } from 'next/navigation';
import { loadPegawaiBumdesDetail } from '../_com/struktur-bumdes.source';
import { STRUKTUR_BUMDES_TEXT as T } from '../_com/struktur-bumdes.text';

/** Profil pengurus BUMDes dari bagan Struktur Pengurus BUMDes. */
export default function DetailPegawaiBumdes() {
  const { id } = useParams<{ id: string }>();
  return <StrukturDetail id={id} load={loadPegawaiBumdesDetail} text={T.detail} />;
}
