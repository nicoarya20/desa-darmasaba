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
import distribusiAgama from '../../../_state/kependudukan/distribusi-agama';
import { toast } from 'react-toastify';

function CreateDistribusiAgama() {
  const stateDistribusiAgama = useProxy(distribusiAgama);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  const isFormValid = () => {
    return (
      stateDistribusiAgama.create.form.agama?.trim() !== '' &&
      stateDistribusiAgama.create.form.jumlah !== null &&
      stateDistribusiAgama.create.form.jumlah >= 0 &&
      stateDistribusiAgama.create.form.tahun !== null
    );
  };

  const resetForm = () => {
    stateDistribusiAgama.create.form = {
      agama: '',
      jumlah: 0,
      tahun: currentYear,
    };
  };

  const handleSubmit = async () => {
    try {
      const id = await stateDistribusiAgama.create.create();
      if (id) {
        resetForm();
        router.push('/admin/kependudukan/distribusi-agama');
      }
    } catch (error) {
      console.error('Error creating distribusi agama:', error);
      toast.error('Terjadi kesalahan saat menambah distribusi agama');
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
          Tambah Distribusi Agama
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
            label="Agama"
            placeholder="Pilih agama"
            data={agamaOptions}
            value={stateDistribusiAgama.create.form.agama}
            onChange={(val) => {
              stateDistribusiAgama.create.form.agama = val || '';
            }}
            required
            searchable
          />
          
          <NumberInput
            label="Jumlah"
            placeholder="Masukkan jumlah"
            value={stateDistribusiAgama.create.form.jumlah}
            onChange={(val) => {
              stateDistribusiAgama.create.form.jumlah = Number(val || 0);
            }}
            min={0}
            required
          />

          <Select
            label="Tahun"
            placeholder="Pilih tahun"
            data={yearOptions}
            value={String(stateDistribusiAgama.create.form.tahun)}
            onChange={(val) => {
              stateDistribusiAgama.create.form.tahun = Number(val || currentYear);
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

export default CreateDistribusiAgama;