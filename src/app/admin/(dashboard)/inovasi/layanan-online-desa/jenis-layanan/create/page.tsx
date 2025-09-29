/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
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
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function CreateJenisLayanan() {
  const router = useRouter();
  const statePasar = useProxy(layananonlineDesa.jenisLayanan);

  useEffect(() => {
    statePasar.findMany.load();
  }, []);

  const resetForm = () => {
    statePasar.create.form = {
      nama: '',
      deskripsi: '',
    };
  };

  const handleSubmit = async () => {
    await statePasar.create.create();
    resetForm();
    router.push('/admin/inovasi/layanan-online-desa/jenis-layanan');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header dengan tombol back */}
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
          Tambah Jenis Layanan
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
          <TextInput
            defaultValue={statePasar.create.form.nama}
            onChange={(val) => {
              statePasar.create.form.nama = val.target.value;
            }}
            label={<Text fw="bold" fz="sm">Nama Jenis Layanan</Text>}
            placeholder="Masukkan nama jenis layanan"
            required
          />
          <TextInput
            defaultValue={statePasar.create.form.deskripsi}
            onChange={(val) => {
              statePasar.create.form.deskripsi = val.target.value;
            }}
            label={<Text fw="bold" fz="sm">Deskripsi</Text>}
            placeholder="Masukkan deskripsi"
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

export default CreateJenisLayanan;
