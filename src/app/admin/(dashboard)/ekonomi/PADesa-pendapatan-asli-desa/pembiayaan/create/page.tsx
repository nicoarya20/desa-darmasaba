'use client';
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreatePembiayaan() {
  const pembiayaanState = useProxy(PendapatanAsliDesa.pembiayaan);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    try {
      setIsSubmitting(true);
      if (!pembiayaanState.create.form.name || !pembiayaanState.create.form.value) {
        return toast.warn('Nama dan nilai wajib diisi');
      }

      await pembiayaanState.create.submit();
      resetForm();
      router.push('/admin/ekonomi/PADesa-pendapatan-asli-desa/pembiayaan');
    } catch (error) {
      console.error('Error creating pembiayaan:', error);
      toast.error('Gagal menambahkan jenis pembiayaan');
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
            value={pembiayaanState.create.form.name}
            onChange={(e) => {
              pembiayaanState.create.form.name = e.currentTarget.value;
            }}
            required
          />

          <TextInput
            type="text"
            label={<Text fw="bold" fz="sm">Nilai</Text>}
            placeholder="Masukkan nilai"
            value={formatRupiah(pembiayaanState.create.form.value)}
            onChange={(e) => {
              const raw = e.currentTarget.value;
              pembiayaanState.create.form.value = unformatRupiah(raw);
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
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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

export default CreatePembiayaan;
