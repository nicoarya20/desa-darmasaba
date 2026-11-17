'use client';
import { useParams } from 'next/navigation';
import { PengurusDetailView } from '../_com/detail/PengurusDetail';

/** Profil pengurus BUMDes dari bagan Struktur Pengurus BUMDes. */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <PengurusDetailView id={id} />;
}
