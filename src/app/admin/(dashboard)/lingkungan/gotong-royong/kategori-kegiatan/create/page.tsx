/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import gotongRoyongState from '../../../../_state/lingkungan/gotong-royong';

function CreateKategoriKegiatan() {
  const router = useRouter();
  const stateKategori = useProxy(gotongRoyongState.kategoriKegiatan)

  useEffect(() => {
    stateKategori.findMany.load();
  }, []);

  const resetForm = () => {
    stateKategori.create.form = {
      nama: "",
    };
  }

  const handleSubmit = async () => {
    await stateKategori.create.create();
    resetForm();
    router.push("/admin/lingkungan/gotong-royong/kategori-kegiatan")
  }

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md" align="center">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" p="xs" radius="md" onClick={() => router.back()}>
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Tambah Kategori Kegiatan
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
            defaultValue={stateKategori.create.form.nama}
            onChange={(val) => (stateKategori.create.form.nama = val.target.value)}
            label={<Text fw="bold" fz="sm">Nama Kategori Kegiatan</Text>}
            placeholder="Masukkan nama kategori kegiatan"
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

export default CreateKategoriKegiatan;
