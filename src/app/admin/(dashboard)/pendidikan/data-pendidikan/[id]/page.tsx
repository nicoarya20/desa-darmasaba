/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import dataPendidikan from '../../../_state/pendidikan/data-pendidikan';

export default function EditDataPendidikan() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const stateDPM = useProxy(dataPendidikan);
  const id = params.id;

  // state lokal untuk form
  const [formData, setFormData] = useState({
    name: '',
    jumlah: '',
  });

  // Load data saat mount
  useEffect(() => {
    if (id) {
      stateDPM.findUnique.load(id).then(() => {
        const data = stateDPM.findUnique.data;
        if (data) {
          setFormData({
            name: data.name || '',
            jumlah: data.jumlah || '',
          });
        }
      });
    }
  }, [id]);

  const handleChange = (field: 'name' | 'jumlah', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // update global state hanya saat submit
    stateDPM.update.id = id;
    stateDPM.update.form = { ...formData };
    await stateDPM.update.submit();
    router.push('/admin/pendidikan/data-pendidikan');
  };

  return (
    <Box px={{ base: 'sm', md: 'xl' }} py="md">
      <Group mb="md" gap="sm">
        <Tooltip label="Kembali ke halaman sebelumnya" position="bottom" withArrow>
          <Button variant="subtle" onClick={() => router.back()} radius="md">
            <IconArrowBack size={20} stroke={2} />
          </Button>
        </Tooltip>
        <Title order={3} c="black">Edit Data Pendidikan</Title>
      </Group>

      <Paper
        withBorder
        w={{ base: '100%', md: '60%' }}
        p="lg"
        radius="md"
        shadow="xl"
        bg="white"
      >
        <Stack gap="md">
          <TextInput
            label="Nama Pendidikan"
            placeholder="Contoh: SD, SMP, SMA"
            value={formData.name}
            onChange={(e) => handleChange('name', e.currentTarget.value)}
            radius="md"
            required
          />
          <TextInput
            label="Jumlah Peserta"
            type="number"
            placeholder="Masukkan jumlah peserta"
            value={formData.jumlah}
            onChange={(e) => handleChange('jumlah', e.currentTarget.value)}
            radius="md"
            required
          />
          <Group justify="right" mt="sm">
            <Button
              onClick={handleSubmit}
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, ${colors['blue-button-trans']})`,
                color: 'white',
                boxShadow: '0 0 10px rgba(0,123,255,0.5)',
                '&:hover': { opacity: 0.9 },
              }}
              radius="md"
              size="md"
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
