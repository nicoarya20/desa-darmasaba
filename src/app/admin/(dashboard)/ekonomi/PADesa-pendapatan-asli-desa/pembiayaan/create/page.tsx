'use client';
import React from 'react';
import { useProxy } from 'valtio/utils';
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import { useRouter } from 'next/navigation';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Title,
  TextInput,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { toast } from 'react-toastify';

function CreatePembiayaan() {
  const pembiayaanState = useProxy(PendapatanAsliDesa.pembiayaan);
  const router = useRouter();

  const formatRupiah = (value: number | string) => {
    const number =
      typeof value === 'number' ? value : Number(value.replace(/\D/g, ''));
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const unformatRupiah = (value: string) => {
    return Number(value.replace(/\D/g, ''));
  };

  const resetForm = () => {
    pembiayaanState.create.form = {
      name: '',
      value: 0,
    };
  };

  const handleSubmit = async () => {
    if (!pembiayaanState.create.form.name || !pembiayaanState.create.form.value) {
      return toast.warn('Nama dan nilai wajib diisi');
    }

    await pembiayaanState.create.submit();
    resetForm();
    router.push('/admin/ekonomi/PADesa-pendapatan-asli-desa/pembiayaan');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button
            variant="subtle"
            onClick={() => router.back()}
            p="xs"
            radius="md"
          >
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Tambah Jenis Pembiayaan
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
          <TextInput
            label={<Text fw="bold" fz="sm">Nama Jenis Pembiayaan</Text>}
            placeholder="Masukkan nama jenis pembiayaan"
            defaultValue={pembiayaanState.create.form.name}
            onChange={(e) => {
              pembiayaanState.create.form.name = e.currentTarget.value;
            }}
            required
          />

          <TextInput
            type="text"
            label={<Text fw="bold" fz="sm">Nilai</Text>}
            placeholder="Masukkan nilai"
            defaultValue={formatRupiah(pembiayaanState.create.form.value)}
            onChange={(e) => {
              const raw = e.currentTarget.value;
              pembiayaanState.create.form.value = unformatRupiah(raw);
            }}
            required
          />

          <Group justify="right">
            <Button
              onClick={handleSubmit}
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
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePembiayaan;
