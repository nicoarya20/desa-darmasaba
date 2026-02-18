/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
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

function EditTarifLayanan() {
  const editState = useProxy(fasilitasKesehatanState.tarif);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.layanan?.trim() !== '' &&
      formData.tarif?.trim() !== ''
    );
  };

  const [originalData, setOriginalData] = useState({
    tarif: '',
    layanan: ''
  });

  const [formData, setFormData] = useState({
    tarif: '',
    layanan: ''
  });

  useEffect(() => {
    const loadTarifLayanan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.update.load(id);
        if (data) {
          setFormData({
            tarif: data.tarif || '',
            layanan: data.layanan || '',
          });
          setOriginalData({
            tarif: data.tarif || '',
            layanan: data.layanan || '',
          });
        }
      } catch (error) {
        console.error('Error loading tarif layanan:', error);
        toast.error('Gagal memuat data tarif layanan');
      }
    };

    loadTarifLayanan();
  }, [params?.id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      tarif: originalData.tarif,
      layanan: originalData.layanan,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    if (!formData.layanan?.trim()) {
      toast.error('Layanan wajib diisi');
      return;
    }

    if (!formData.tarif?.trim()) {
      toast.error('Tarif wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      // update global state hanya saat submit
      editState.update.form = {
        ...editState.update.form,
        tarif: formData.tarif,
        layanan: formData.layanan,
      };

      await editState.update.submit();
      toast.success('Tarif Layanan berhasil diperbarui!');
      router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/tarif-layanan');
    } catch (error) {
      console.error('Error updating tarif layanan:', error);
      toast.error('Terjadi kesalahan saat memperbarui tarif layanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Back Button + Title */}
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
          Edit Tarif Layanan
        </Title>
      </Group>

      {/* Form Wrapper */}
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
            name="layanan"
            label="Layanan"
            placeholder="Masukkan nama layanan"
            value={formData.layanan}
            onChange={(e) => handleChange('layanan', e.target.value)}
            required
          />

          <TextInput
            name="tarif"
            label="Tarif"
            placeholder="Masukkan tarif layanan"
            value={formData.tarif}
            onChange={(e) => handleChange('tarif', e.target.value)}
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

export default EditTarifLayanan;
