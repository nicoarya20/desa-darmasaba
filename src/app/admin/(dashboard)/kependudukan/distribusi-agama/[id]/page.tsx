/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  TextInput,
  Title,
  NumberInput,
  Select
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import distribusiAgama from '../../../_state/kependudukan/distribusi-agama';

interface FormData {
  agama: string;
  jumlah: number;
  tahun: number;
}

export default function EditDistribusiAgama() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const stateDistribusiAgama = useProxy(distribusiAgama);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    agama: '',
    jumlah: 0,
    tahun: new Date().getFullYear(),
  });
  const [originalData, setOriginalData] = useState<FormData>({
    agama: '',
    jumlah: 0,
    tahun: new Date().getFullYear(),
  });

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  const agamaOptions = [
    { value: 'HINDU', label: 'Hindu' },
    { value: 'ISLAM', label: 'Islam' },
    { value: 'KRISTEN', label: 'Kristen' },
    { value: 'KRISTEN_PROTESTAN', label: 'Kristen Protestan' },
    { value: 'KRISTEN_KATOLIK', label: 'Kristen Katolik' },
    { value: 'BUDDHA', label: 'Buddha' },
    { value: 'KONGHUCU', label: 'Konghucu' },
    { value: 'LAINNYA', label: 'Lainnya' },
  ];

  const isFormValid = () => {
    return (
      formData.agama?.trim() !== '' &&
      formData.jumlah !== null &&
      formData.jumlah >= 0 &&
      formData.tahun !== null
    );
  };

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setIsSubmitting(true);
        stateDistribusiAgama.update.id = id;
        await stateDistribusiAgama.findUnique.load(id);

        const data = stateDistribusiAgama.findUnique.data;
        if (data) {
          setFormData({
            agama: data.agama ?? '',
            jumlah: Number(data.jumlah ?? 0),
            tahun: Number(data.tahun ?? currentYear),
          });
          setOriginalData({
            agama: data.agama ?? '',
            jumlah: Number(data.jumlah ?? 0),
            tahun: Number(data.tahun ?? currentYear),
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Gagal memuat data');
      } finally {
        setIsSubmitting(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = useCallback(
    (field: keyof FormData) =>
      (value: any) => {
        const val =
          field === 'jumlah' || field === 'tahun'
            ? Number(value || 0)
            : value;

        setFormData((prev) => ({ ...prev, [field]: val }));
      },
    []
  );

  const handleResetForm = () => {
    setFormData({
      agama: originalData.agama,
      jumlah: Number(originalData.jumlah),
      tahun: Number(originalData.tahun),
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      stateDistribusiAgama.update.id = id;
      stateDistribusiAgama.update.form = { ...formData };

      await stateDistribusiAgama.update.submit();

      toast.success('Data berhasil diperbarui');
      router.push('/admin/kependudukan/distribusi-agama');
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Gagal memperbarui data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Distribusi Agama
        </Title>
      </Group>

      {/* Form Card */}
      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <Select
            label="Agama"
            placeholder="Pilih agama"
            data={agamaOptions}
            value={formData.agama}
            onChange={handleChange('agama')}
            required
            searchable
          />

          <NumberInput
            label="Jumlah"
            placeholder="Masukkan jumlah"
            value={formData.jumlah}
            onChange={handleChange('jumlah')}
            min={0}
            required
          />

          <Select
            label="Tahun"
            placeholder="Pilih tahun"
            data={yearOptions}
            value={String(formData.tahun)}
            onChange={handleChange('tahun')}
            required
          />

          <Group justify="flex-end">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
            </Button>

            {/* Tombol Simpan */}
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