/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import dataPendidikan from '../../../_state/pendidikan/data-pendidikan';

export default function CreateDataPendidikan() {
  const stateDPM = useProxy(dataPendidikan);
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter();

  const resetForm = () => {
    stateDPM.create.form = { name: '', jumlah: '' };
  };

  const handleSubmit = async () => {
    const id = await stateDPM.create.create();
    if (id) {
      const idStr = String(id);
      await stateDPM.findUnique.load(idStr);
      if (stateDPM.findUnique.data) setChartData([stateDPM.findUnique.data]);
    }
    resetForm();
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
        <Title order={3} c='black'>Tambah Data Pendidikan</Title>
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
            defaultValue={stateDPM.create.form.name}
            onChange={(e) => (stateDPM.create.form.name = e.currentTarget.value)}
            radius="md"
            required
          />
          <TextInput
            label="Jumlah Peserta"
            placeholder="Masukkan jumlah peserta"
            defaultValue={stateDPM.create.form.jumlah}
            onChange={(e) => (stateDPM.create.form.jumlah = e.currentTarget.value)}
            radius="md"
            type="number"
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

      {chartData.length === 0 && (
        <Text mt="md" c={colors['white-1']} ta="center">
          Data belum tersedia. Silakan tambahkan data pendidikan baru.
        </Text>
      )}
    </Box>
  );
}
