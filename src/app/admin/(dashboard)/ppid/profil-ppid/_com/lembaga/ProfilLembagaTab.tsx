'use client';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import stateProfilLembagaPPID, { type ProfilLembaga } from '../../../../_state/ppid/profil_lembaga/profilLembaga';
import { LembagaGambarField } from './LembagaGambarField';

const PPIDTextEditor = dynamic(
  () => import('@/app/admin/(dashboard)/ppid/_com/PPIDTextEditor').then((mod) => mod.PPIDTextEditor),
  { ssr: false },
);

type TeksForm = { deskripsi: string; tujuan: string; tugasFungsi: string };
const EMPTY_FORM: TeksForm = { deskripsi: '', tujuan: '', tugasFungsi: '' };
const BAGIAN_TEKS: { key: keyof TeksForm; label: string }[] = [
  { key: 'deskripsi', label: 'Deskripsi' },
  { key: 'tujuan', label: 'Tujuan' },
  { key: 'tugasFungsi', label: 'Tugas dan Fungsi' },
];

/** Unggah gambar ke FileStorage; kembalikan id-nya, atau null bila gagal (toast sudah tampil). */
async function uploadGambar(file: File): Promise<string | null> {
  try {
    const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
    const id = res.data?.data?.id;
    if (!id) toast.error('Gagal mengunggah gambar alur');
    return id ?? null;
  } catch (error) {
    console.error(`Gagal mengunggah gambar alur ${file.name}:`, error);
    toast.error('Terjadi kesalahan saat mengunggah gambar alur');
    return null;
  }
}

/** Tab "Profil Lembaga" di admin Profil PPID: satu form (buat bila belum ada, ubah bila sudah ada) tanpa halaman edit terpisah. */
export default function ProfilLembagaTab() {
  const [form, setForm] = useState<TeksForm>(EMPTY_FORM);
  const [gambarBaru, setGambarBaru] = useState<{ file: File; url: string } | null>(null);
  const [gambarDilepas, setGambarDilepas] = useState(false);
  const [saved, setSaved] = useState<{ link: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const apply = (data: ProfilLembaga | null) => {
    setForm({ deskripsi: data?.deskripsi ?? '', tujuan: data?.tujuan ?? '', tugasFungsi: data?.tugasFungsi ?? '' });
    setSaved(data?.gambarAlur ?? null);
    setGambarBaru(null);
    setGambarDilepas(false);
  };

  useEffect(() => {
    void stateProfilLembagaPPID.find.load().then((data) => {
      apply(data);
      setReady(true);
    });
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let gambarAlurId: string | null | undefined;
      if (gambarBaru) {
        gambarAlurId = await uploadGambar(gambarBaru.file);
        if (!gambarAlurId) return;
      } else if (gambarDilepas) {
        gambarAlurId = null;
      }
      if (await stateProfilLembagaPPID.save.submit({ ...form, gambarAlurId })) {
        apply(stateProfilLembagaPPID.find.data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const previewUrl = gambarBaru?.url ?? (gambarDilepas ? null : (saved?.link ?? null));

  return (
    <Paper w={{ base: '100%', md: '60%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm" style={{ border: '1px solid #e0e0e0' }}>
      <Stack gap="xl">
        <Title order={4} c={colors['blue-button']}>Profil Lembaga PPID</Title>
        {!ready ? (
          <Group justify="center" py="xl"><Loader size="sm" /></Group>
        ) : (
          <>
            {BAGIAN_TEKS.map(({ key, label }) => (
              <Box key={key}>
                <Text fw="bold" fz="sm" mb={6}>{label}</Text>
                <Box style={{ border: '1px solid #dee2e6', borderRadius: '0.25rem' }}>
                  <PPIDTextEditor
                    showSubmit={false}
                    toolbar="basic"
                    initialContent={form[key]}
                    onChange={(value) => setForm((prev) => ({ ...prev, [key]: value }))}
                  />
                </Box>
              </Box>
            ))}
            <LembagaGambarField
              previewUrl={previewUrl}
              onPick={(file) => {
                setGambarBaru({ file, url: URL.createObjectURL(file) });
                setGambarDilepas(false);
              }}
              onRemove={() => {
                setGambarBaru(null);
                setGambarDilepas(true);
              }}
            />
            <Group justify="right">
              <Button variant="outline" color="gray" radius="md" size="md" onClick={() => apply(stateProfilLembagaPPID.find.data)}>
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                loading={submitting}
                radius="md"
                size="md"
                style={{
                  background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                  color: '#fff',
                  boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
                }}
              >
                Simpan
              </Button>
            </Group>
          </>
        )}
      </Stack>
      <Text fz="xs" c="dimmed" mt="md">Teks hanya mendukung huruf tebal, miring, dan daftar; format lain dibuang saat disimpan.</Text>
    </Paper>
  );
}
