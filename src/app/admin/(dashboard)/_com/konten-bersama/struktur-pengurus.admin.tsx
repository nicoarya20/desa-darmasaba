'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import type { DaftarAnakState } from '@/app/admin/(dashboard)/_state/konten-bersama/daftar-anak.state';
import type { PengurusItem } from '@/lib/konten-bersama/konten-bersama.types';
import { ActionIcon, Avatar, Box, Button, Group, Paper, Skeleton, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import PengurusFormModal from './pengurus.form-modal';

type Props = {
  state: DaftarAnakState<PengurusItem>;
  /** Batas jumlah pengurus domain ini. */
  max: number;
  judul?: string;
};

type Form = { pengurus: PengurusItem | null } | null;

/** Section admin struktur pengurus (semua domain): daftar nama + jabatan + foto, tambah/edit, urutan, hapus. */
export default function StrukturPengurusAdmin({ state, max, judul = 'Pengurus' }: Props) {
  const snap = useSnapshot(state);
  const [form, setForm] = useState<Form>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const pengurus = snap.data as readonly PengurusItem[];

  const handleDelete = async () => {
    if (deleteId && (await state.hapus(deleteId))) setDeleteId(null);
  };

  return (
    <Box data-testid="struktur-pengurus-admin">
      <Group justify="space-between" mb="xs">
        <Title order={4}>{judul}</Title>
        <Button size="xs" leftSection={<IconPlus size={14} />} disabled={pengurus.length >= max} onClick={() => setForm({ pengurus: null })}>
          Tambah Pengurus
        </Button>
      </Group>

      {!snap.loaded ? (
        <Skeleton height={120} radius="md" />
      ) : pengurus.length === 0 ? (
        <Text c="dimmed" fz="sm">Belum ada pengurus.</Text>
      ) : (
        <Stack gap="xs">
          {pengurus.map((p, index) => (
            <Paper key={p.id} withBorder p="xs" radius="md" data-testid="pengurus-admin-item">
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Avatar src={p.image?.link ?? null} alt={p.nama} radius="xl">{p.nama.slice(0, 1)}</Avatar>
                  <Box>
                    <Text fw={600} fz="sm">{p.nama}</Text>
                    <Text c="dimmed" fz="xs">{p.jabatan}</Text>
                  </Box>
                </Group>
                <Group gap={4} wrap="nowrap">
                  <Tooltip label="Geser ke atas">
                    <ActionIcon variant="light" aria-label={`Geser ${p.nama} ke atas`} disabled={snap.reordering || index === 0} onClick={() => void state.geser(index, -1)}>
                      <IconArrowUp size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Geser ke bawah">
                    <ActionIcon variant="light" aria-label={`Geser ${p.nama} ke bawah`} disabled={snap.reordering || index === pengurus.length - 1} onClick={() => void state.geser(index, 1)}>
                      <IconArrowDown size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <ActionIcon variant="light" color="green" aria-label={`Edit ${p.nama}`} onClick={() => setForm({ pengurus: p })}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="red" aria-label={`Hapus ${p.nama}`} onClick={() => setDeleteId(p.id)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      {form && <PengurusFormModal key={form.pengurus?.id ?? 'baru'} state={state} pengurus={form.pengurus} onClose={() => setForm(null)} />}
      <ModalKonfirmasiHapus
        opened={deleteId !== null}
        loading={snap.deleting}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        text="Pengurus beserta fotonya akan dihapus permanen. Lanjutkan?"
      />
    </Box>
  );
}
