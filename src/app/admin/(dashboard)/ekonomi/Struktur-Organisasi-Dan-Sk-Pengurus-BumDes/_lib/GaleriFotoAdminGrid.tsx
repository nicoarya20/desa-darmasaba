'use client'
import type { FotoProfilBumdesData } from '@/app/admin/(dashboard)/_state/ekonomi/bumdes/foto-profil';
import { SimpleGrid, Text } from '@mantine/core';
import GaleriFotoAdminCard from './GaleriFotoAdminCard';

type Props = {
  foto: readonly FotoProfilBumdesData[];
  savingId: string | null;
  moveLocked: boolean;
  onSaveKeterangan: (id: string, keterangan: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onDelete: (id: string) => void;
};

/** Grid thumbnail galeri foto BUMDes di admin, urut sesuai tampilan publik. */
export default function GaleriFotoAdminGrid({ foto, savingId, moveLocked, onSaveKeterangan, onMove, onDelete }: Props) {
  if (foto.length === 0) {
    return <Text c="dimmed" fz="sm">Belum ada foto di galeri.</Text>;
  }
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md">
      {foto.map((f, index) => (
        <GaleriFotoAdminCard
          key={f.id}
          foto={f}
          index={index}
          total={foto.length}
          saving={savingId === f.id}
          moveLocked={moveLocked}
          onSaveKeterangan={(keterangan) => onSaveKeterangan(f.id, keterangan)}
          onMove={(direction) => onMove(index, direction)}
          onDelete={() => onDelete(f.id)}
        />
      ))}
    </SimpleGrid>
  );
}
