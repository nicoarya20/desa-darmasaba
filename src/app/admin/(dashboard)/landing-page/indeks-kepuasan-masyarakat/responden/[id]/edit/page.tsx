'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import indeksKepuasanState from '@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack, IconDeviceFloppy } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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

  // Helper untuk load pilihan select
  const loadSelectOptions = useCallback(() => {
    indeksKepuasanState.jenisKelaminResponden.findMany.load();
    indeksKepuasanState.pilihanRatingResponden.findMany.load();
    indeksKepuasanState.kelompokUmurResponden.findMany.load();
  }, []);

  // Load data responden
  const loadResponden = useCallback(async () => {
    if (!id) return;

    try {
      const data = await state.update.load(id);
      if (!data) return;

      setFormData({
        name: data.name,
        tanggal: data.tanggal,
        jenisKelaminId: data.jenisKelaminId,
        ratingId: data.ratingId,
        kelompokUmurId: data.kelompokUmurId,
      });
    } catch (error) {
      console.error("Error loading responden:", error);
      toast.error("Gagal memuat data responden");
    }
  }, [id]);

  useEffect(() => {
    loadSelectOptions();
    loadResponden();
  }, [loadSelectOptions, loadResponden]);

  const handleSubmit = async () => {
    state.update.id = id;
    state.update.form = { ...formData }; // sinkronisasi manual
    await state.update.submit();
    router.push('/admin/landing-page/indeks-kepuasan-masyarakat/responden');
  };

  // Reusable Select component
  const ControlledSelect = ({
    label,
    value,
    onChange,
    options,
    error,
    placeholder = 'Pilih',
    loading = false,
  }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    error?: string;
    placeholder?: string;
    loading?: boolean;
  }) => {
    return (
      <Select
        label={<Text fw="bold" fz="sm" mb={4}>{label}</Text>}
        value={value}
        onChange={(val) => onChange(val || '')}
        data={options}
        placeholder={placeholder}
        disabled={loading}
        clearable
        searchable
        required
        radius="md"
        error={error}
      />
    );
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
            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
            radius="md"
            required
          />
          <TextInput
            label="Tanggal"
            type="date"
            value={formData.tanggal ? new Date(formData.tanggal).toISOString().split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, tanggal: e.currentTarget.value })}
            radius="md"
            required
          />

          <ControlledSelect
            label="Jenis Kelamin"
            value={formData.jenisKelaminId}
            onChange={(val) => setFormData({ ...formData, jenisKelaminId: val })}
            options={(indeksKepuasanState.jenisKelaminResponden.findMany.data || [])
              .filter(Boolean)
              .map((v) => ({ value: v.id || '', label: v.name || 'Tanpa Nama' }))}
            loading={indeksKepuasanState.jenisKelaminResponden.findMany.loading}
            error={!formData.jenisKelaminId ? 'Pilih jenis kelamin' : undefined}
          />

          <ControlledSelect
            label="Rating"
            value={formData.ratingId}
            onChange={(val) => setFormData({ ...formData, ratingId: val })}
            options={(indeksKepuasanState.pilihanRatingResponden.findMany.data || [])
              .filter(Boolean)
              .map((v) => ({ value: v.id || '', label: v.name || 'Tanpa Nama' }))}
            loading={indeksKepuasanState.pilihanRatingResponden.findMany.loading}
            error={!formData.ratingId ? 'Pilih rating' : undefined}
          />

          <ControlledSelect
            label="Kelompok Umur"
            value={formData.kelompokUmurId}
            onChange={(val) => setFormData({ ...formData, kelompokUmurId: val })}
            options={(indeksKepuasanState.kelompokUmurResponden.findMany.data || [])
              .filter(Boolean)
              .map((v) => ({ value: v.id || '', label: v.name || 'Tanpa Nama' }))}
            loading={indeksKepuasanState.kelompokUmurResponden.findMany.loading}
            error={!formData.kelompokUmurId ? 'Pilih kelompok umur' : undefined}
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
