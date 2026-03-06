/* eslint-disable react-hooks/exhaustive-deps */
'use client';

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
import { useCallback, useEffect, useState } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    pekerjaan: '',
    lakiLaki: 0,
    perempuan: 0,
  });
  const [originalData, setOriginalData] = useState<FormData>({
    pekerjaan: '',
    lakiLaki: 0,
    perempuan: 0,
  });

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.pekerjaan?.trim() !== '' &&
      formData.lakiLaki !== null &&
      formData.lakiLaki >= 0 &&
      formData.perempuan !== null &&
      formData.perempuan >= 0
    );
  };

  // ✅ Load data hanya sekali di awal (tidak reset form)
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setIsSubmitting(true);
        stateDemografi.update.id = id;
        await stateDemografi.findUnique.load(id);

        const data = stateDemografi.findUnique.data;
        if (data) {
          setFormData({
            pekerjaan: data.pekerjaan ?? '',
            lakiLaki: Number(data.lakiLaki ?? 0),
            perempuan: Number(data.perempuan ?? 0),
          });
          setOriginalData({
            pekerjaan: data.pekerjaan ?? '',
            lakiLaki: Number(data.lakiLaki ?? 0),
            perempuan: Number(data.perempuan ?? 0),
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Gagal memuat data');
      } finally {
        setIsSubmitting(false);
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

  const handleResetForm = () => {
    setFormData({
      pekerjaan: originalData.pekerjaan,
      lakiLaki: Number(originalData.lakiLaki),
      perempuan: Number(originalData.perempuan),
    });
    toast.info("Form dikembalikan ke data awal");
  };

  // ✅ Submit hanya update global state sekali
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      stateDemografi.update.id = id;
      stateDemografi.update.form = { ...formData };

      await stateDemografi.update.submit();

      toast.success('Data berhasil diperbarui');
      router.push('/admin/ekonomi/demografi-pekerjaan');
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Gagal memperbarui data');
    } finally {
      setIsSubmitting(false);
    }
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
