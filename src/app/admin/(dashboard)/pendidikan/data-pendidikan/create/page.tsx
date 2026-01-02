/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import dataPendidikan from '../../../_state/pendidikan/data-pendidikan';
import { toast } from 'react-toastify';

export default function CreateDataPendidikan() {
  const stateDPM = useProxy(dataPendidikan);
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    stateDPM.create.form = { name: '', jumlah: '' };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const id = await stateDPM.create.create();
      if (id) {
        const idStr = String(id);
        await stateDPM.findUnique.load(idStr);
        if (stateDPM.findUnique.data) setChartData([stateDPM.findUnique.data]);
      }
      resetForm();
      router.push('/admin/pendidikan/data-pendidikan');
    } catch (error) {
      console.error("Error creating data pendidikan:", error);
      toast.error("Terjadi kesalahan saat menambahkan data pendidikan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md" gap="sm">
        <Button variant="subtle" onClick={() => router.back()} radius="md">
          <IconArrowBack size={20} stroke={2} />
        </Button>
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
            value={stateDPM.create.form.name}
            onChange={(e) => (stateDPM.create.form.name = e.currentTarget.value)}
            radius="md"
            required
          />
          <TextInput
            label="Jumlah Peserta"
            placeholder="Masukkan jumlah peserta"
            value={stateDPM.create.form.jumlah}
            onChange={(e) => (stateDPM.create.form.jumlah = e.currentTarget.value)}
            radius="md"
            type="number"
            required
          />
          <Group justify="right">
            {/* Tombol Batal */}
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

      {chartData.length === 0 && (
        <Text mt="md" c={colors['white-1']} ta="center">
          Data belum tersedia. Silakan tambahkan data pendidikan baru.
        </Text>
      )}
    </Box>
  );
}
