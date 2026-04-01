/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import jumlahPendudukMiskin from '@/app/admin/(dashboard)/_state/ekonomi/jumlah-penduduk-miskin';
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

function EditJumlahPendudukMiskin() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const stateJPM = useProxy(jumlahPendudukMiskin);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = params.id;

  // 🔹 State lokal untuk form
  const [formData, setFormData] = useState({
    year: 0,
    totalPoorPopulation: 0,
  });

  const [originalData, setOriginalData] = useState({
    year: 0,
    totalPoorPopulation: 0,
  });

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.year !== null &&
      formData.year > 0 &&
      formData.totalPoorPopulation !== null &&
      formData.totalPoorPopulation >= 0
    );
  };

  // 🔹 Load data awal dari backend
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        await stateJPM.findUnique.load(id);
        const data = stateJPM.findUnique.data;
        if (data) {
          setFormData({
            year: data.year || 0,
            totalPoorPopulation: data.totalPoorPopulation || 0,
          });
          setOriginalData({
            year: data.year || 0,
            totalPoorPopulation: data.totalPoorPopulation || 0,
          });
        }
      } catch (error) {
        console.error('Gagal memuat data:', error);
        toast.error('Gagal memuat data jumlah penduduk miskin');
      }
    };

    loadData();
  }, [id]);

  // 🔹 Handler input controlled
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const handleResetForm = () => {
    setFormData({
      year: originalData.year,
      totalPoorPopulation: originalData.totalPoorPopulation,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  // 🔹 Submit form
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      stateJPM.update.id = id;
      // update global state cuma saat submit
      stateJPM.update.form = { ...formData };

      await stateJPM.update.submit();
      toast.success('Data jumlah penduduk miskin berhasil diperbarui!');
      router.push('/admin/ekonomi/jumlah-penduduk-miskin');
    } catch (error) {
      console.error('Gagal menyimpan data:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
   <Box px={{ base: 0, md: 'lg' }} py="xs">
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
          Edit Jumlah Penduduk Miskin
        </Title>
      </Group>

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
            label="Tahun"
            placeholder="Masukkan tahun"
            type="number"
            required
            value={formData.year}
            onChange={(e) => handleChange('year', e.currentTarget.value)}
          />

          <TextInput
            label="Jumlah Penduduk Miskin"
            placeholder="Masukkan jumlah penduduk miskin"
            type="number"
            required
            value={formData.totalPoorPopulation}
            onChange={(e) =>
              handleChange('totalPoorPopulation', e.currentTarget.value)
            }
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

export default EditJumlahPendudukMiskin;
