/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import grafikNganggur from '@/app/admin/(dashboard)/_state/ekonomi/usia-kerja-nganggur';
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

function EditGrafikBerdasarkanUsiaKerjaYangMenganggur() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const stategrafik = useProxy(
    grafikNganggur.grafikBerdasarkanUsiaKerjaNganggur
  );
  const id = params.id;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ state lokal, controlled
  const [formData, setFormData] = useState({
    usia18_25: '',
    usia26_35: '',
    usia36_45: '',
    usia46_keatas: '',
  });

  const [originalData, setOriginalData] = useState({
    usia18_25: '',
    usia26_35: '',
    usia36_45: '',
    usia46_keatas: '',
  });

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.usia18_25?.trim() !== '' &&
      formData.usia26_35?.trim() !== '' &&
      formData.usia36_45?.trim() !== '' &&
      formData.usia46_keatas?.trim() !== ''
    );
  };

  // load data dari global state -> masukin ke local state
  useEffect(() => {
    if (id) {
      stategrafik.findUnique.load(id).then(() => {
        const data = stategrafik.findUnique.data;
        if (data) {
          setFormData({
            usia18_25: data.usia18_25 || '',
            usia26_35: data.usia26_35 || '',
            usia36_45: data.usia36_45 || '',
            usia46_keatas: data.usia46_keatas || '',
          });
          setOriginalData({
            usia18_25: data.usia18_25 || '',
            usia26_35: data.usia26_35 || '',
            usia36_45: data.usia36_45 || '',
            usia46_keatas: data.usia46_keatas || '',
          });
          
        }
      });
    }
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetForm = () => {
    setFormData({
      usia18_25: originalData.usia18_25,
      usia26_35: originalData.usia26_35,
      usia36_45: originalData.usia36_45,
      usia46_keatas: originalData.usia46_keatas,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // ✅ baru update global state pas submit
      stategrafik.update.id = id;
      stategrafik.update.form = { ...formData };

      await stategrafik.update.submit();

      toast.success('Data grafik berhasil diperbarui!');
      router.push(
        '/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia'
      );
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat memperbarui data grafik');
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
          Edit Grafik Pengangguran Berdasarkan Usia Kerja
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
            label="Usia 18 - 25"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.usia18_25}
            onChange={(e) => handleChange('usia18_25', e.currentTarget.value)}
            required
          />
          <TextInput
            label="Usia 26 - 35"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.usia26_35}
            onChange={(e) => handleChange('usia26_35', e.currentTarget.value)}
            required
          />
          <TextInput
            label="Usia 36 - 45"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.usia36_45}
            onChange={(e) => handleChange('usia36_45', e.currentTarget.value)}
            required
          />
          <TextInput
            label="Usia 46 +"
            type="number"
            placeholder="Masukkan jumlah"
            value={formData.usia46_keatas}
            onChange={(e) => handleChange('usia46_keatas', e.currentTarget.value)}
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

export default EditGrafikBerdasarkanUsiaKerjaYangMenganggur;
