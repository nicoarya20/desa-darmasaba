/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import persentaseKelahiranKematian from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import { convertToISODate } from '../../../lib/dateUtils';

function EditKematian() {
  const editState = useProxy(persentaseKelahiranKematian.kematian);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.nama?.trim() !== '' &&
      formData.tanggal !== '' &&
      formData.jenisKelamin?.trim() !== '' &&
      formData.alamat?.trim() !== '' &&
      !isHtmlEmpty(formData.penyebab)
    );
  };

  const [formData, setFormData] = useState({
    nama: '',
    tanggal: '',
    jenisKelamin: '',
    alamat: '',
    penyebab: '',
  });

  const [originalData, setOriginalData] = useState({
    nama: '',
    tanggal: '',
    jenisKelamin: '',
    alamat: '',
    penyebab: '',
  });

  // Load data saat mount
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.edit.load(id);
        if (data) {
          const formattedTanggal = convertToISODate(data.tanggal);

          setFormData({
            nama: data.nama || '',
            tanggal: formattedTanggal,
            jenisKelamin: data.jenisKelamin || '',
            alamat: data.alamat || '',
            penyebab: data.penyebab || ''
          });

          setOriginalData({
            nama: data.nama || '',
            tanggal: formattedTanggal,
            jenisKelamin: data.jenisKelamin || '',
            alamat: data.alamat || '',
            penyebab: data.penyebab || ''
          });
        }
      } catch (error) {
        console.error('Error loading data kematian:', error);
        toast.error('Gagal memuat data kematian');
      }
    };

    loadData();
  }, [params?.id]);

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
      tanggal: originalData.tanggal,
      jenisKelamin: originalData.jenisKelamin,
      alamat: originalData.alamat,
      penyebab: originalData.penyebab,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    if (!formData.nama?.trim()) {
      toast.error('Nama wajib diisi');
      return;
    }

    if (!formData.tanggal) {
      toast.error('Tanggal wajib diisi');
      return;
    }

    if (!formData.jenisKelamin?.trim()) {
      toast.error('Jenis kelamin wajib diisi');
      return;
    }

    if (!formData.alamat?.trim()) {
      toast.error('Alamat wajib diisi');
      return;
    }

    if (isHtmlEmpty(formData.penyebab)) {
      toast.error('Penyebab wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      // Update global state saat submit
      editState.edit.form = { ...editState.edit.form, ...formData };
      await editState.edit.update();
      toast.success('Data kematian berhasil diperbarui!');
      router.push(
        '/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kematian'
      );
    } catch (error) {
      console.error('Error updating data kematian:', error);
      toast.error('Terjadi kesalahan saat memperbarui data kematian');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Data Kematian
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
            label="Nama"
            placeholder="Masukkan nama"
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            required
          />

          <TextInput
            type="date"
            label="Tanggal"
            placeholder="Masukkan tanggal"
            value={formData.tanggal}
            onChange={(e) => handleChange('tanggal', e.target.value)}
            required
          />

          <TextInput
            label="Jenis Kelamin"
            placeholder="Masukkan jenis kelamin"
            value={formData.jenisKelamin}
            onChange={(e) => handleChange('jenisKelamin', e.target.value)}
            required
          />

          <TextInput
            label="Alamat"
            placeholder="Masukkan alamat"
            value={formData.alamat}
            onChange={(e) => handleChange('alamat', e.target.value)}
            required
          />

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Penyebab
            </Text>
            <EditEditor
              value={formData.penyebab}
              onChange={(htmlContent) => handleChange('penyebab', htmlContent)}
            />
          </Box>

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

export default EditKematian;
