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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import distribusiUmur from '../../../_state/kependudukan/distribusi-umur';
import { toast } from 'react-toastify';

function CreateDistribusiUmur() {
  const stateDistribusiUmur = useProxy(distribusiUmur, { sync: true }); // sync: cegah caret jump di controlled input
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  const isFormValid = () => {
    return (
      stateDistribusiUmur.create.form.rentangUmur?.trim() !== '' &&
      stateDistribusiUmur.create.form.jumlah !== null &&
      stateDistribusiUmur.create.form.jumlah >= 0 &&
      stateDistribusiUmur.create.form.tahun !== null
    );
  };

  const resetForm = () => {
    stateDistribusiUmur.create.form = {
      rentangUmur: '',
      jumlah: 0,
      tahun: currentYear,
    };
  };

  const handleSubmit = async () => {
    try {
      const id = await stateDistribusiUmur.create.create();
      if (id) {
        resetForm();
        router.push('/admin/kependudukan/distribusi-umur');
      }
    } catch (error) {
      console.error('Error creating distribusi umur:', error);
      toast.error('Terjadi kesalahan saat menambah distribusi umur');
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
          Tambah Distribusi Umur
        </Title>
      </Group>

      {/* Form */}
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
            value={stateDistribusiUmur.create.form.rentangUmur}
            onChange={(val) => {
              stateDistribusiUmur.create.form.rentangUmur = val || '';
            }}
            required
            searchable
          />

          <NumberInput
            label="Jumlah"
            placeholder="Masukkan jumlah"
            value={stateDistribusiUmur.create.form.jumlah}
            onChange={(val) => {
              stateDistribusiUmur.create.form.jumlah = Number(val || 0);
            }}
            min={0}
            required
          />

          <Select
            label="Tahun"
            placeholder="Pilih tahun"
            data={yearOptions}
            value={String(stateDistribusiUmur.create.form.tahun)}
            onChange={(val) => {
              stateDistribusiUmur.create.form.tahun = Number(val || currentYear);
            }}
            required
          />

          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
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

export default CreateDistribusiUmur;
