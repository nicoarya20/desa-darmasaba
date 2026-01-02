/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import colors from '@/con/colors';
import { Box, Button, Loader, Group, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import dataPendidikan from '../../../_state/pendidikan/data-pendidikan';
import { toast } from 'react-toastify';

export default function EditDataPendidikan() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const stateDPM = useProxy(dataPendidikan);
  const id = params.id;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // state lokal untuk form
  const [formData, setFormData] = useState({
    name: '',
    jumlah: '',
  });

  const [originalData, setOriginalData] = useState({
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
          setOriginalData({
            name: data.name || '',
            jumlah: data.jumlah || '',
          });
        }
      });
    }
  }, [id]);

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      jumlah: originalData.jumlah,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleChange = (field: 'name' | 'jumlah', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // update global state hanya saat submit
    stateDPM.update.id = id;
    stateDPM.update.form = { ...formData };
    await stateDPM.update.submit();
    router.push('/admin/pendidikan/data-pendidikan');
    } catch (error) {
      console.error("Error updating data pendidikan:", error);
      toast.error("Terjadi kesalahan saat memperbarui data pendidikan");
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
          <Group justify="right">
            {/* Tombol Batal */}
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
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
