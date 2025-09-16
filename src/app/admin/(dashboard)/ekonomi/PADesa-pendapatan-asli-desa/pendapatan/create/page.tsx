'use client';
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function CreatePendapatan() {
  const pendapatanState = useProxy(PendapatanAsliDesa.pendapatan);
  const router = useRouter();

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
    await pendapatanState.create.submit();
    resetForm();
    router.push('/admin/ekonomi/PADesa-pendapatan-asli-desa/pendapatan');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header dengan tombol back + judul */}
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
            label={
              <Text fw="bold" fz="sm">
                Nama Jenis Pendapatan
              </Text>
            }
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
            label={
              <Text fw="bold" fz="sm">
                Nilai
              </Text>
            }
            placeholder="Masukkan nilai"
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

export default CreatePendapatan;
