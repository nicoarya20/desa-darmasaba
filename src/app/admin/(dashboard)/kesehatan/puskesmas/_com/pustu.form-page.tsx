'use client'
import pustuState from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/pustu.state';
import { cekFormPustu, type PustuForm } from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/pustu.form';
import colors from '@/con/colors';
import { Box, Button, Divider, Group, Paper, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useSnapshot } from 'valtio';
import PustuFormFields from './pustu.form-fields';
import PustuKontenFields from './pustu.konten-fields';

type Props = {
  judul: string;
  /** Nilai awal form (kosong untuk tambah, dari detail untuk edit). */
  awal: PustuForm;
  /** Id PUSTU yang diedit; null = tambah baru. */
  id: string | null;
  onSaved: (id: string) => void;
  /** Section tambahan di bawah form (struktur & galeri di halaman edit). */
  children?: ReactNode;
};

/** Kerangka halaman tambah/edit PUSTU: judul, form profil + konten, tombol Reset/Simpan, dan section tambahan. */
export default function PustuFormPage({ judul, awal, id, onSaved, children }: Props) {
  const router = useRouter();
  const { saving } = useSnapshot(pustuState);
  const [form, setForm] = useState<PustuForm>(awal);
  const [fotoBaru, setFotoBaru] = useState<File | null>(null);
  const [baganBaru, setBaganBaru] = useState<File | null>(null);
  const valid = cekFormPustu(form) === null;
  const ubah = (patch: Partial<PustuForm>) => setForm((lama) => ({ ...lama, ...patch }));

  const simpan = async () => {
    const savedId = await pustuState.simpan(id, form, { foto: fotoBaru, bagan: baganBaru });
    if (savedId) onSaved(savedId);
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md" aria-label="Kembali">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">{judul}</Title>
      </Group>

      <Paper w={{ base: '100%', md: '70%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm" withBorder>
        <PustuFormFields value={form} onChange={ubah} fotoBaru={fotoBaru} onFotoBaru={setFotoBaru} />
        <Divider my="lg" />
        <PustuKontenFields value={form} onChange={ubah} baganBaru={baganBaru} onBaganBaru={setBaganBaru} />
        <Group justify="right" mt="lg">
          <Button
            variant="outline"
            color="gray"
            radius="md"
            onClick={() => {
              setForm(awal);
              setFotoBaru(null);
              setBaganBaru(null);
            }}
          >
            Reset
          </Button>
          <Button radius="md" onClick={() => void simpan()} disabled={!valid} loading={saving}>
            Simpan
          </Button>
        </Group>
      </Paper>
      {children}
    </Box>
  );
}
