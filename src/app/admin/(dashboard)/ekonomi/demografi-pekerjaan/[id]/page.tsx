/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import demografiPekerjaan from '../../../_state/ekonomi/demografi-pekerjaan';

interface FormData {
  pekerjaan: string;
  lakiLaki: number;
  perempuan: number;
}

export default function EditDemografiPekerjaan() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const stateDemografi = useProxy(demografiPekerjaan);

  const [formData, setFormData] = useState<FormData>({
    pekerjaan: '',
    lakiLaki: 0,
    perempuan: 0,
  });

  // ✅ Load data hanya sekali di awal (tidak reset form)
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        stateDemografi.update.id = id;
        await stateDemografi.findUnique.load(id);

        const data = stateDemografi.findUnique.data;
        if (data) {
          setFormData({
            pekerjaan: data.pekerjaan ?? '',
            lakiLaki: Number(data.lakiLaki ?? 0),
            perempuan: Number(data.perempuan ?? 0),
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Gagal memuat data');
      }
    };

    loadData();
  }, [id]);

  // ✅ Handler input terkontrol (tidak buat re-render berlebihan)
  const handleChange = useCallback(
    (field: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value =
          field === 'lakiLaki' || field === 'perempuan'
            ? Number(e.currentTarget.value)
            : e.currentTarget.value;

        setFormData((prev) => ({ ...prev, [field]: value }));
      },
    []
  );

  // ✅ Submit hanya update global state sekali
  const handleSubmit = async () => {
    try {
      stateDemografi.update.id = id;
      stateDemografi.update.form = { ...formData };

      await stateDemografi.update.submit();

      toast.success('Data berhasil diperbarui');
      router.push('/admin/ekonomi/demografi-pekerjaan');
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Gagal memperbarui data');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
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
          Edit Demografi Pekerjaan
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
            label="Pekerjaan"
            placeholder="Masukkan jenis pekerjaan"
            value={formData.pekerjaan}
            onChange={handleChange('pekerjaan')}
            required
          />

          <TextInput
            label="Jumlah Pekerja Laki-laki"
            type="number"
            placeholder="Masukkan jumlah pekerja laki-laki"
            value={formData.lakiLaki}
            onChange={handleChange('lakiLaki')}
            required
          />

          <TextInput
            label="Jumlah Pekerja Perempuan"
            type="number"
            placeholder="Masukkan jumlah pekerja perempuan"
            value={formData.perempuan}
            onChange={handleChange('perempuan')}
            required
          />

          <Group justify="flex-end">
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
