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

function EditBelanja() {
  const belanjaState = useProxy(PendapatanAsliDesa.belanja);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: belanjaState.update.form.name || '',
    value: belanjaState.update.form.value || '',
  });

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

  useEffect(() => {
    const loadBelanja = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await belanjaState.update.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            value: data.value || '',
          });
        }
      } catch (error) {
        console.error("Error loading belanja:", error);
        toast.error("Gagal memuat data belanja");
      }
    };

    loadBelanja();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      belanjaState.update.form = {
        ...belanjaState.update.form,
        name: formData.name,
        value: Number(formData.value),
      }

      await belanjaState.update.update();
      toast.success("Jenis Belanja berhasil diperbarui!");
      router.push("/admin/ekonomi/PADesa-pendapatan-asli-desa/belanja");
    } catch (error) {
      console.error("Error updating jenis belanja:", error);
      toast.error("Terjadi kesalahan saat memperbarui jenis belanja");
    }
  }

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
          Edit Jenis Belanja
        </Title>
      </Group>

      {/* Card */}
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
            label="Nama Jenis Belanja"
            placeholder="Masukkan nama jenis belanja"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <TextInput
            label="Nilai"
            placeholder="Masukkan nilai"
            value={formatRupiah(formData.value)}
            onChange={(e) => {
              const raw = e.currentTarget.value;
              const cleanValue = unformatRupiah(raw);
              setFormData({ ...formData, value: cleanValue });
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

export default EditBelanja;
