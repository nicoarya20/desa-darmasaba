/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import indeksKepuasanState from '@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Select, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface FormResponden {
  name: string;
  tanggal: string;
  jenisKelaminId: string;
  ratingId: string;
  kelompokUmurId: string;
}

function EditResponden() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const state = useProxy(indeksKepuasanState.responden);
  const id = params.id;

  const [formData, setFormData] = useState<FormResponden>({
    name: '',
    tanggal: '',
    jenisKelaminId: '',
    ratingId: '',
    kelompokUmurId: '',
  });

  // Helper untuk membuat data Select dari state
  const mapSelectData = (data: any[] | null | undefined) =>
    (data || [])
      .filter(Boolean)
      .map((v: any) => ({
        value: v.id || '',
        label: typeof v.name === 'string' ? v.name : 'Tanpa Nama',
      }));

  useEffect(() => {
    // Load opsi dropdown
    indeksKepuasanState.jenisKelaminResponden.findMany.load();
    indeksKepuasanState.pilihanRatingResponden.findMany.load();
    indeksKepuasanState.kelompokUmurResponden.findMany.load();

    const loadResponden = async () => {
      if (!id) return;

      try {
        const data = await state.update.load(id);
        if (data) {
          state.update.id = id;

          // **formData lokal tetap controlled**, tidak overwrite tiap render
          setFormData({
            name: data.name || '',
            tanggal: data.tanggal || '',
            jenisKelaminId: data.jenisKelaminId || '',
            ratingId: data.ratingId || '',
            kelompokUmurId: data.kelompokUmurId || '',
          });
        }
      } catch (error) {
        console.error("Error loading responden:", error);
        toast.error("Gagal memuat data responden");
      }
    };

    loadResponden();
  }, [id, state.update]);

  const handleChange = (field: keyof FormResponden) => (e: ChangeEvent<HTMLInputElement> | string | null) => {
    const value = typeof e === 'string' || e === null ? e || '' : e.currentTarget.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    state.update.id = id;
    state.update.form = { ...formData }; // hanya update global state saat submit
    await state.update.submit();
    router.push('/admin/ppid/ikm-desa-darmasaba/responden');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Responden
        </Title>
      </Group>

      <Paper
        withBorder
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <TextInput
            label="Nama Responden"
            placeholder="Masukkan nama responden"
            value={formData.name}
            onChange={handleChange('name')}
            radius="md"
            required
          />
          <TextInput
            label="Tanggal"
            type="date"
            value={formData.tanggal ? new Date(formData.tanggal).toISOString().split('T')[0] : ''}
            onChange={handleChange('tanggal')}
            radius="md"
            required
          />

          <Select
            label="Jenis Kelamin"
            placeholder="Pilih jenis kelamin"
            value={formData.jenisKelaminId}
            onChange={handleChange('jenisKelaminId')}
            data={mapSelectData(indeksKepuasanState.jenisKelaminResponden.findMany.data)}
            disabled={indeksKepuasanState.jenisKelaminResponden.findMany.loading}
            clearable
            searchable
            required
            radius="md"
            error={!formData.jenisKelaminId ? "Pilih jenis kelamin" : undefined}
          />

          <Select
            label="Rating"
            placeholder="Pilih rating"
            value={formData.ratingId}
            onChange={handleChange('ratingId')}
            data={mapSelectData(indeksKepuasanState.pilihanRatingResponden.findMany.data)}
            disabled={indeksKepuasanState.pilihanRatingResponden.findMany.loading}
            clearable
            searchable
            required
            radius="md"
            error={!formData.ratingId ? "Pilih rating" : undefined}
          />

          <Select
            label="Kelompok Umur"
            placeholder="Pilih kelompok umur"
            value={formData.kelompokUmurId}
            onChange={handleChange('kelompokUmurId')}
            data={mapSelectData(indeksKepuasanState.kelompokUmurResponden.findMany.data)}
            disabled={indeksKepuasanState.kelompokUmurResponden.findMany.loading}
            clearable
            searchable
            required
            radius="md"
            error={!formData.kelompokUmurId ? "Pilih kelompok umur" : undefined}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" color="red" onClick={() => router.back()}>
              Batal
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={20} />}
              onClick={handleSubmit}
              loading={state.update.loading}
              color={colors['blue-button']}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditResponden;
