'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import profilPosyanduState from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu-profil.state';
import {
  cekFormProfil,
  type KlasterForm,
  type ProfilPosyanduForm,
} from '@/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu-profil.form';
import type { SasaranKlaster } from '@/lib/posyandu/posyandu-konten.validation';
import { Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import KlasterFields from './klaster.fields';

/** Form admin deskripsi umum posyandu + kegiatan 3 klaster; disimpan sekaligus. */
export default function ProfilKlasterForm({ awal }: { awal: ProfilPosyanduForm }) {
  const { saving } = useSnapshot(profilPosyanduState);
  const [form, setForm] = useState<ProfilPosyanduForm>(awal);
  const [gambarBaru, setGambarBaru] = useState<Partial<Record<SasaranKlaster, File>>>({});
  const error = cekFormProfil(form);

  const ubahKlaster = (sasaran: SasaranKlaster, patch: Partial<KlasterForm>) =>
    setForm((lama) => ({ ...lama, klaster: lama.klaster.map((k) => (k.sasaran === sasaran ? { ...k, ...patch } : k)) }));

  const pilihGambar = (sasaran: SasaranKlaster, file: File | null) =>
    setGambarBaru((lama) => {
      const baru = { ...lama };
      if (file) baru[sasaran] = file;
      else delete baru[sasaran];
      return baru;
    });

  const simpan = async () => {
    if (await profilPosyanduState.simpan(form, gambarBaru)) setGambarBaru({});
  };

  return (
    <Stack gap="lg" data-testid="profil-klaster-form">
      <Box>
        <Title order={4} mb={4}>Deskripsi Umum Posyandu</Title>
        <Text fz="sm" c="dimmed" mb="sm">Tampil di bagian atas halaman publik Posyandu.</Text>
        <EditEditor value={form.deskripsi} onChange={(deskripsi) => setForm((lama) => ({ ...lama, deskripsi }))} />
      </Box>
      <Box>
        <Title order={5} mb="sm">Fungsi dan Kegiatan Utama (opsional)</Title>
        <EditEditor value={form.fungsiKegiatan} onChange={(fungsiKegiatan) => setForm((lama) => ({ ...lama, fungsiKegiatan }))} />
      </Box>
      <Box>
        <Title order={4} mb="sm">Kegiatan per Klaster</Title>
        <Stack gap="md">
          {form.klaster.map((k) => (
            <KlasterFields
              key={k.sasaran}
              value={k}
              onChange={(patch) => ubahKlaster(k.sasaran, patch)}
              gambarBaru={gambarBaru[k.sasaran] ?? null}
              onGambarBaru={(file) => pilihGambar(k.sasaran, file)}
            />
          ))}
        </Stack>
      </Box>
      <Group justify="right">
        {error ? <Text fz="sm" c="dimmed">{error}</Text> : null}
        <Button
          variant="outline"
          color="gray"
          radius="md"
          onClick={() => {
            setForm(awal);
            setGambarBaru({});
          }}
        >
          Reset
        </Button>
        <Button radius="md" onClick={() => void simpan()} disabled={error !== null} loading={saving}>
          Simpan
        </Button>
      </Group>
    </Stack>
  );
}
