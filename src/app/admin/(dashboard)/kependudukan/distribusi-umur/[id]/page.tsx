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
  Title,
  NumberInput,
  Select
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import distribusiUmur from '../../../_state/kependudukan/distribusi-umur';

interface DistribusiUmurForm {
  rentangUmur: string;
  jumlah: number;
  tahun: number;
}

export default function EditDistribusiUmur() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const stateDistribusiUmur = useProxy(distribusiUmur);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DistribusiUmurForm>({
    rentangUmur: '',
    jumlah: 0,
    tahun: new Date().getFullYear(),
  });
  const [originalData, setOriginalData] = useState<DistribusiUmurForm>({
    rentangUmur: '',
    jumlah: 0,
    tahun: new Date().getFullYear(),
  });

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  const rentangUmurOptions = [
    { value: '0-5', label: '0-5 Tahun' },
    { value: '6-12', label: '6-12 Tahun' },
    { value: '13-17', label: '13-17 Tahun' },
    { value: '18-25', label: '18-25 Tahun' },
    { value: '26-35', label: '26-35 Tahun' },
    { value: '36-45', label: '36-45 Tahun' },
    { value: '46-55', label: '46-55 Tahun' },
    { value: '56-65', label: '56-65 Tahun' },
    { value: '65+', label: '65+ Tahun' },
  ];

  const isFormValid = () => {
    return (
      formData.rentangUmur?.trim() !== '' &&
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
        stateDistribusiUmur.update.id = id;
        await stateDistribusiUmur.findUnique.load(id);

        const data = stateDistribusiUmur.findUnique.data as DistribusiUmurForm | null;
        if (data) {
          setFormData({
            rentangUmur: data.rentangUmur ?? '',
            jumlah: Number(data.jumlah ?? 0),
            tahun: Number(data.tahun ?? currentYear),
          });
          setOriginalData({
            rentangUmur: data.rentangUmur ?? '',
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

  const handleChangeNumber = useCallback(
    (field: keyof DistribusiUmurForm) =>
      (value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: (typeof value === 'string' ? Number(value) || 0 : (value ?? 0)) as never }));
      },
    []
  );

  const handleChangeSelect = useCallback(
    (field: keyof DistribusiUmurForm) =>
      (value: string | null) => {
        setFormData((prev) => ({ ...prev, [field]: (value || '') as never }));
      },
    []
  );

  const handleResetForm = () => {
    setFormData({
      rentangUmur: originalData.rentangUmur,
      jumlah: Number(originalData.jumlah),
      tahun: Number(originalData.tahun),
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      stateDistribusiUmur.update.id = id;
      stateDistribusiUmur.update.form = { ...formData };

      await stateDistribusiUmur.update.submit();

      toast.success('Data berhasil diperbarui');
      router.push('/admin/kependudukan/distribusi-umur');
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
          Edit Distribusi Umur
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
            label="Rentang Umur"
            placeholder="Pilih rentang umur"
            data={rentangUmurOptions}
            value={formData.rentangUmur}
            onChange={handleChangeSelect('rentangUmur')}
            required
            searchable
          />

          <NumberInput
            label="Jumlah"
            placeholder="Masukkan jumlah"
            value={formData.jumlah}
            onChange={handleChangeNumber('jumlah')}
            min={0}
            required
          />

          <Select
            label="Tahun"
            placeholder="Pilih tahun"
            data={yearOptions}
            value={String(formData.tahun)}
            onChange={handleChangeSelect('tahun')}
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
