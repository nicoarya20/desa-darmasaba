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

function EditPendapatan() {
  const pendapatanState = useProxy(PendapatanAsliDesa.pendapatan);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [originalData, setOriginalData] = useState({
    name: "",
    value: "",
  });

  const [formData, setFormData] = useState({
    name: '',
    value: '',
  });

  // helper format
  const formatRupiah = (value: number | string) => {
    const number = typeof value === 'number'
      ? value
      : Number(value.toString().replace(/\D/g, ''));

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const unformatRupiah = (value: string) => Number(value.replace(/\D/g, ''));

  // load data once
  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;

    const loadPendapatan = async () => {
      try {
        const data = await pendapatanState.update.load(id);
        if (data) {
          setFormData({
            name: data.name ?? '',
            value: data.value?.toString() ?? '',
          });
          setOriginalData({
            name: data.name ?? '',
            value: data.value?.toString() ?? '',
          });
        }
      } catch (error) {
        console.error('Error loading pendapatan:', error);
        toast.error('Gagal memuat data pendapatan');
      }
    };

    loadPendapatan();
  }, [params?.id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      value: originalData.value,
    });
    toast.info("Form dikembalikan ke data awal");
  };


  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      pendapatanState.update.form = {
        ...pendapatanState.update.form,
        name: formData.name,
        value: Number(formData.value),
      };

      await pendapatanState.update.update();
      toast.success('Jenis Pendapatan berhasil diperbarui!');
      router.push('/admin/ekonomi/PADesa-pendapatan-asli-desa/pendapatan');
    } catch (error) {
      console.error('Error updating jenis pendapatan:', error);
      toast.error('Terjadi kesalahan saat memperbarui jenis pendapatan');
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Header with Back Button */}
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
          Edit Jenis Pendapatan
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
            label="Nama Jenis Pendapatan"
            placeholder="Masukkan nama jenis pendapatan"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />

          <TextInput
            label="Nilai"
            placeholder="Masukkan nilai"
            value={formData.value ? formatRupiah(formData.value) : ''}
            onChange={(e) => {
              const raw = e.currentTarget.value;
              const cleanValue = unformatRupiah(raw).toString();
              handleChange('value', cleanValue);
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

export default EditPendapatan;
