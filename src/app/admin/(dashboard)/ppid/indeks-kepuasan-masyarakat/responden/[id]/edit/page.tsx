/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import indeksKepuasanState from '@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
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
  const id = params.id;

  // ✅ proxy asli untuk mutasi
  const state = indeksKepuasanState.responden;
  // ✅ snapshot untuk re-render (read-only)
  const snapshot = useProxy(indeksKepuasanState.responden);

  const [formData, setFormData] = useState<FormResponden>({
    name: '',
    tanggal: '',
    jenisKelaminId: '',
    ratingId: '',
    kelompokUmurId: '',
  });

  const [originalData, setOriginalData] = useState<FormResponden>({
    name: '',
    tanggal: '',
    jenisKelaminId: '',
    ratingId: '',
    kelompokUmurId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      formData.tanggal?.trim() !== '' &&
      formData.jenisKelaminId?.trim() !== '' &&
      formData.ratingId?.trim() !== '' &&
      formData.kelompokUmurId?.trim() !== ''
    );
  };

  // 🔹 Load data pilihan select
  const loadSelectOptions = useCallback(() => {
    indeksKepuasanState.jenisKelaminResponden.findMany.load();
    indeksKepuasanState.pilihanRatingResponden.findMany.load();
    indeksKepuasanState.kelompokUmurResponden.findMany.load();
  }, []);

  // 🔹 Load data responden by ID
  const loadResponden = useCallback(async () => {
    if (!id) return;
    try {
      const data = await state.update.load(id);
      if (!data) return;

      const newForm = {
        name: data.name || '',
        tanggal: data.tanggal || '',
        jenisKelaminId: data.jenisKelaminId || '',
        ratingId: data.ratingId || '',
        kelompokUmurId: data.kelompokUmurId || '',
      };

      setFormData(newForm);
      setOriginalData(newForm);
    } catch (error) {
      console.error('Error loading responden:', error);
      toast.error('Gagal memuat data responden');
    }
  }, [id]);

  useEffect(() => {
    loadSelectOptions();
    loadResponden();
  }, [loadSelectOptions, loadResponden]);

  // 🔹 Submit data
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      state.update.id = id;
      state.update.form = { ...formData }; // mutasi proxy asli ✅
      await state.update.submit();
      toast.success('Responden berhasil diperbarui!');
      router.push('/admin/ppid/indeks-kepuasan-masyarakat/responden');
    } catch (error) {
      console.error('Error updating responden:', error);
      toast.error('Gagal memperbarui responden');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔹 Reset form ke data awal
  const handleResetForm = () => {
    setFormData({ ...originalData });
    toast.info('Form dikembalikan ke data awal');
  };

  // 🔹 Reusable Select component
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
  }) => (
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

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
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
              .map((v) => ({ value: v.id || '', label: v.name || 'Tanpa Nama' }))}
            loading={indeksKepuasanState.jenisKelaminResponden.findMany.loading}
            error={!formData.jenisKelaminId ? 'Pilih jenis kelamin' : undefined}
          />

          <ControlledSelect
            label="Rating"
            value={formData.ratingId}
            onChange={(val) => setFormData({ ...formData, ratingId: val })}
            options={(indeksKepuasanState.pilihanRatingResponden.findMany.data || [])
              .map((v) => ({ value: v.id || '', label: v.name || 'Tanpa Nama' }))}
            loading={indeksKepuasanState.pilihanRatingResponden.findMany.loading}
            error={!formData.ratingId ? 'Pilih rating' : undefined}
          />

          <ControlledSelect
            label="Kelompok Umur"
            value={formData.kelompokUmurId}
            onChange={(val) => setFormData({ ...formData, kelompokUmurId: val })}
            options={(indeksKepuasanState.kelompokUmurResponden.findMany.data || [])
              .map((v) => ({ value: v.id || '', label: v.name || 'Tanpa Nama' }))}
            loading={indeksKepuasanState.kelompokUmurResponden.findMany.loading}
            error={!formData.kelompokUmurId ? 'Pilih kelompok umur' : undefined}
          />

          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
            </Button>

            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditResponden;
