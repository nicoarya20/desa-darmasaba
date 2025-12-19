/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import persentaseKelahiranKematian from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/persentaseKelahiran';
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
import { convertToISODate } from '../../../lib/dateUtils';

function EditKelahiran() {
  const editState = useProxy(persentaseKelahiranKematian.kelahiran);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    tanggal: '',
    jenisKelamin: '',
    alamat: '',
  });

  const [originalData, setOriginalData] = useState({
    nama: '',
    tanggal: '',
    jenisKelamin: '',
    alamat: '',
  });

  // Load data saat mount atau params.id berubah
  useEffect(() => {
    const loadKelahiran = async () => {
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
            alamat: data.alamat || ''
          });
  
          setOriginalData({
            nama: data.nama || '',
            tanggal: formattedTanggal,
            jenisKelamin: data.jenisKelamin || '',
            alamat: data.alamat || ''
          });
        }
      } catch (error) {
        console.error('Error loading data kelahiran:', error);
        toast.error('Gagal memuat data kelahiran');
      }
    };
  
    loadKelahiran();
  }, [params?.id]);

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
      tanggal: originalData.tanggal,
      jenisKelamin: originalData.jenisKelamin,
      alamat: originalData.alamat,
    });
    toast.info("Form dikembalikan ke data awal");
  };


  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Update global state hanya saat submit
      editState.edit.form = { ...editState.edit.form, ...formData };
      await editState.edit.update();
      toast.success('Data kelahiran berhasil diperbarui!');
      router.push('/admin/kesehatan/data-kesehatan-warga/persentase_data_kelahiran_kematian/kelahiran');
    } catch (error) {
      console.error('Error updating data kelahiran:', error);
      toast.error('Terjadi kesalahan saat memperbarui data kelahiran');
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
          Edit Data Kelahiran
        </Title>
      </Group>

      {/* Form */}
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
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            label="Nama"
            placeholder="Masukkan nama"
            required
          />
          <TextInput
            type="date"
            value={formData.tanggal}
            onChange={(e) => handleChange('tanggal', e.target.value)}
            label="Tanggal"
            placeholder="Masukkan tanggal"
            required
          />
          <TextInput
            value={formData.jenisKelamin}
            onChange={(e) => handleChange('jenisKelamin', e.target.value)}
            label="Jenis Kelamin"
            placeholder="Masukkan jenis kelamin"
            required
          />
          <TextInput
            value={formData.alamat}
            onChange={(e) => handleChange('alamat', e.target.value)}
            label="Alamat"
            placeholder="Masukkan alamat"
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

export default EditKelahiran;
