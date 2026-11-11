'use client';
import { StrukturDetail } from '@/app/(public)/_com/struktur-organisasi/StrukturDetail';
import { useParams } from 'next/navigation';
import { loadPegawaiPpidDetail } from '../_com/struktur-ppid.source';
import { STRUKTUR_PPID_TEXT as T } from '../_com/struktur-ppid.text';

/** Profil pegawai PPID dari bagan Struktur Organisasi PPID. */
export default function DetailPegawaiPpid() {
  const { id } = useParams<{ id: string }>();
  return <StrukturDetail id={id} load={loadPegawaiPpidDetail} text={T.detail} />;
}
