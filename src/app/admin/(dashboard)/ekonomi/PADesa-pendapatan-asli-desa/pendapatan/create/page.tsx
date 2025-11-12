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
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreatePendapatan() {
  const pendapatanState = useProxy(PendapatanAsliDesa.pendapatan);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatRupiah = (value: number | string) => {
    const number = typeof value === 'number' ? value : Number(value.replace(/\D/g, ''));
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
    pendapatanState.create.form = {
      name: '',
      value: 0,
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await pendapatanState.create.submit();
      resetForm();
      router.push('/admin/ekonomi/PADesa-pendapatan-asli-desa/pendapatan');
    } catch (error) {
      console.error('Error creating pendapatan:', error);
      toast.error('Gagal menambahkan jenis pendapatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header dengan tombol back + judul */}
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
          Tambah Jenis Pendapatan
        </Title>
      </Group>

      {/* Card Form */}
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
            value={pendapatanState.create.form.name}
            onChange={(val) => {
              pendapatanState.create.form.name = val.target.value;
            }}
            label="Nama Jenis Pendapatan"
            placeholder="Masukkan nama jenis pendapatan"
            required
          />

          <TextInput
            type="text"
            value={formatRupiah(pendapatanState.create.form.value)}
            onChange={(val) => {
              const raw = val.currentTarget.value;
              const cleanValue = unformatRupiah(raw);
              pendapatanState.create.form.value = cleanValue;
            }}
            label="Nilai"
            placeholder="Masukkan nilai"
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

export default CreatePendapatan;
