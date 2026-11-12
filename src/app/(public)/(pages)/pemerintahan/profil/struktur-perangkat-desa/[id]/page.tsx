'use client';
import { StrukturDetail } from '@/app/(public)/_com/struktur-organisasi/StrukturDetail';
import { useParams } from 'next/navigation';
import { STRUKTUR_PERANGKAT_TEXT as T } from '../../_com/profil.text';
import { loadPerangkatDetail } from '../../_com/struktur-perangkat.source';

/** Profil perangkat desa dari bagan Struktur Perangkat Desa. */
export default function DetailPerangkatDesa() {
  const { id } = useParams<{ id: string }>();
  return <StrukturDetail id={id} load={loadPerangkatDetail} text={T.detail} />;
}
