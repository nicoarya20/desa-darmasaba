'use client'
import keteranganSampah from '@/app/admin/(dashboard)/_state/lingkungan/bank-sampah/bank-sampah.state';
import { cekFormBankSampah, type BankSampahForm } from '@/app/admin/(dashboard)/_state/lingkungan/bank-sampah/bank-sampah.form';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useSnapshot } from 'valtio';
import BankSampahFormFields from './bank-sampah.form-fields';

type Props = {
  judul: string;
  /** Nilai awal form (kosong untuk tambah, dari detail untuk edit). */
  awal: BankSampahForm;
  /** Id bank sampah yang diedit; null = tambah baru. */
  id: string | null;
  onSaved: (id: string) => void;
  /** Section tambahan di bawah form (pengurus & dokumentasi di halaman edit). */
  children?: ReactNode;
};

/** Kerangka halaman tambah/edit bank sampah: judul, form, tombol Reset/Simpan, dan section tambahan. */
export default function BankSampahFormPage({ judul, awal, id, onSaved, children }: Props) {
  const router = useRouter();
  const { saving } = useSnapshot(keteranganSampah);
  const [form, setForm] = useState<BankSampahForm>(awal);
  const [baganBaru, setBaganBaru] = useState<File | null>(null);
  const valid = cekFormBankSampah(form) === null;

  const simpan = async () => {
    const savedId = await keteranganSampah.simpan(id, form, baganBaru);
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
        <BankSampahFormFields
          value={form}
          onChange={(patch) => setForm((lama) => ({ ...lama, ...patch }))}
          baganBaru={baganBaru}
          onBaganBaru={setBaganBaru}
        />
        <Group justify="right" mt="lg">
          <Button
            variant="outline"
            color="gray"
            radius="md"
            onClick={() => {
              setForm(awal);
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
