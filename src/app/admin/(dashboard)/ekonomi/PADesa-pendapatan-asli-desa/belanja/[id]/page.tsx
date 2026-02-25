/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  TextInput,
  Title
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    value: '',
  });

  const [originalData, setOriginalData] = useState({
    name: '',
    value: '',
  });

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      formData.value !== '' &&
      Number(formData.value) > 0
    );
  };

  // format angka ke rupiah
  const formatRupiah = (value: number | string) => {
    const number =
      typeof value === 'number'
        ? value
        : Number(value.replace(/\D/g, '')) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  // buang semua simbol jadi angka murni
  const unformatRupiah = (value: string) => {
    return Number(value.replace(/\D/g, '')) || 0;
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
            value: String(data.value || ''),
          });
          setOriginalData({
            name: data.name || '',
            value: String(data.value || ''),
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
      setIsSubmitting(true);
      belanjaState.update.form = {
        ...belanjaState.update.form,
        name: formData.name,
        value: Number(formData.value),
      };

      await belanjaState.update.update();
      toast.success("Jenis Belanja berhasil diperbarui!");
      router.push("/admin/ekonomi/PADesa-pendapatan-asli-desa/belanja");
    } catch (error) {
      console.error("Error updating jenis belanja:", error);
      toast.error("Terjadi kesalahan saat memperbarui jenis belanja");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      value: originalData.value,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  return (
   <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
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
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
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
              setFormData({ ...formData, value: String(cleanValue) });
            }}
            required
          />

          <Group justify="right">
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
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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

export default EditBelanja;
