'use client'
import ringkasanKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/ringkasan-kesehatan/ringkasanKesehatan';
import { cekFormPosyandu, type PosyanduForm } from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu.form';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Text, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useSnapshot } from 'valtio';
import PosyanduFormFields from './posyandu.form-fields';

type Props = {
  judul: string;
  /** Nilai awal form (kosong untuk tambah, dari detail untuk edit). */
  awal: PosyanduForm;
  /** Gambar utama tersimpan (edit); null = belum ada. */
  gambarUrl: string | null;
  /** Simpan form; `gambarBaru` = file pengganti gambar utama (null = tetap). True bila berhasil. */
  onSimpan: (form: PosyanduForm, gambarBaru: File | null) => Promise<boolean>;
  /** Section tambahan di bawah form (galeri di halaman edit, info di halaman tambah). */
  children?: ReactNode;
};

/** Kerangka halaman tambah/edit posyandu banjar: judul, form, tombol Reset/Simpan, section tambahan. */
export default function PosyanduFormPage({ judul, awal, gambarUrl, onSimpan, children }: Props) {
  const router = useRouter();
  const banjar = useSnapshot(ringkasanKesehatanState.findBanjar);
  const [form, setForm] = useState<PosyanduForm>(awal);
  const [gambarBaru, setGambarBaru] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const error = cekFormPosyandu(form, gambarBaru !== null || gambarUrl !== null);

  useEffect(() => {
    void ringkasanKesehatanState.findBanjar.load();
  }, []);

  const simpan = async () => {
    setSaving(true);
    try {
      if (await onSimpan(form, gambarBaru)) router.push('/admin/kesehatan/posyandu/list-posyandu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md" aria-label="Kembali">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">{judul}</Title>
      </Group>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm" withBorder>
        <PosyanduFormFields
          value={form}
          onChange={(patch) => setForm((lama) => ({ ...lama, ...patch }))}
          banjar={banjar.data}
          gambarUrl={gambarUrl}
          gambarBaru={gambarBaru}
          onGambarBaru={setGambarBaru}
        />
        <Group justify="right" mt="lg">
          {error ? <Text fz="sm" c="dimmed">{error}</Text> : null}
          <Button
            variant="outline"
            color="gray"
            radius="md"
            onClick={() => {
              setForm(awal);
              setGambarBaru(null);
            }}
          >
            Reset
          </Button>
          <Button radius="md" onClick={() => void simpan()} disabled={error !== null} loading={saving}>
            Simpan
          </Button>
        </Group>
      </Paper>
      {children}
    </Box>
  );
}
