/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Select,
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
import infoSekolahPaud from '../../../../_state/pendidikan/info-sekolah-paud';

function CreateLembaga() {
  const router = useRouter();
  const stateLembaga = useProxy(infoSekolahPaud.lembagaPendidikan);

  useEffect(() => {
    stateLembaga.findMany.load();
    infoSekolahPaud.jenjangPendidikan.findMany.load();
  }, []);

  const resetForm = () => {
    stateLembaga.create.form = {
      nama: '',
      jenjangId: '',
    };
  };

  const handleSubmit = async () => {
    await stateLembaga.create.create();
    resetForm();
    router.push('/admin/pendidikan/info-sekolah/lembaga');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Tambah Lembaga Pendidikan
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
            value={stateLembaga.create.form.nama}
            onChange={(val) => {
              stateLembaga.create.form.nama = val.target.value;
            }}
            label={<Text fw="bold" fz="sm">Nama Lembaga</Text>}
            placeholder="Masukkan nama lembaga"
            required
          />

          <Select
            label={<Text fw="bold" fz="sm">Jenjang Pendidikan</Text>}
            placeholder="Pilih jenjang pendidikan"
            searchable
            data={
              infoSekolahPaud.jenjangPendidikan.findMany.data?.map((j) => ({
                value: j.id,
                label: j.nama,
              })) || []
            }
            value={stateLembaga.create.form.jenjangId}
            onChange={(val) => {
              stateLembaga.create.form.jenjangId = val || '';
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

export default CreateLembaga;
