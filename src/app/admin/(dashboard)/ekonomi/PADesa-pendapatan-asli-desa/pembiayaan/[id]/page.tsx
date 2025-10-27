/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  TextInput,
  Title,
  Tooltip
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPembiayaan() {
  const pembiayaanState = useProxy(PendapatanAsliDesa.pembiayaan);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: '',
    value: '',
  });

  const formatRupiah = (value: number | string) => {
    const number =
      typeof value === 'number'
        ? value
        : Number(value.toString().replace(/\D/g, '')) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const unformatRupiah = (value: string) => {
    return Number(value.replace(/\D/g, '')) || 0;
  };

  useEffect(() => {
    const loadPembiayaan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await pembiayaanState.update.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            value: String(data.value || ''),
          });
        }
      } catch (error) {
        console.error('Error loading pembiayaan:', error);
        toast.error('Gagal memuat data pembiayaan');
      }
    };

    loadPembiayaan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      pembiayaanState.update.form = {
        ...pembiayaanState.update.form,
        name: formData.name,
        value: unformatRupiah(formData.value),
      };

      await pembiayaanState.update.update();
      toast.success('Jenis Pembiayaan berhasil diperbarui!');
      router.push('/admin/ekonomi/PADesa-pendapatan-asli-desa/pembiayaan');
    } catch (error) {
      console.error('Error updating jenis pembiayaan:', error);
      toast.error('Terjadi kesalahan saat memperbarui jenis pembiayaan');
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
          Edit Jenis Pembiayaan
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
            label="Nama Jenis Pembiayaan"
            placeholder="Masukkan nama jenis pembiayaan"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />

          <TextInput
            label="Nilai"
            placeholder="Masukkan nilai"
            value={formData.value ? formatRupiah(formData.value) : ''}
            onChange={(e) => {
              const raw = e.currentTarget.value;
              const cleanValue = unformatRupiah(raw);
              setFormData((prev) => ({ ...prev, value: String(cleanValue) }));
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

export default EditPembiayaan;
