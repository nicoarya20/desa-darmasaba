/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import grafikkepuasan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/grafikKepuasan';
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
import { convertToISODate } from '../../../persentase_data_kelahiran_kematian/lib/dateUtils';

function EditGrafikHasilKepuasan() {
  const editState = useProxy(grafikkepuasan);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    tanggal: '',
    jenisKelamin: '',
    alamat: '',
    penyakit: '',
  });

  const [originalData, setOriginalData] = useState({
    nama: '',
    tanggal: '',
    jenisKelamin: '',
    alamat: '',
    penyakit: '',
  });

  // Load data once
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.update.load(id);
        if (data) {
          const formattedTanggal = convertToISODate(data.tanggal);

          setFormData({
            nama: data.nama || '',
            tanggal: formattedTanggal,
            jenisKelamin: data.jenisKelamin || '',
            alamat: data.alamat || '',
            penyakit: data.penyakit || '',
          });

          setOriginalData({
            nama: data.nama || '',
            tanggal: formattedTanggal,
            jenisKelamin: data.jenisKelamin || '',
            alamat: data.alamat || '',
            penyakit: data.penyakit || '',
          });
        }
      } catch (err) {
        console.error("Error loading grafik hasil kepuasan:", err);
        toast.error("Gagal memuat data grafik hasil kepuasan");
      }
    };

    loadData();
  }, [params?.id]);

  // Generic handler for controlled inputs
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
      tanggal: originalData.tanggal,
      jenisKelamin: originalData.jenisKelamin,
      alamat: originalData.alamat,
      penyakit: originalData.penyakit,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      editState.update.form = { ...editState.update.form, ...formData };
      await editState.update.submit();
      toast.success('Grafik hasil kepuasan berhasil diperbarui!');
      router.push('/admin/kesehatan/data-kesehatan-warga/grafik_hasil_kepuasan');
    } catch (err) {
      console.error('Error updating grafik hasil kepuasan:', err);
      toast.error('Terjadi kesalahan saat memperbarui grafik hasil kepuasan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
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
          Edit Grafik Hasil Kepuasan
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
          {(['nama', 'tanggal', 'jenisKelamin', 'alamat', 'penyakit'] as const).map((field) => (
            <TextInput
              key={field}
              value={formData[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              type={field === 'tanggal' ? 'date' : 'text'}
              label={field === 'jenisKelamin' ? 'Jenis Kelamin' : field.charAt(0).toUpperCase() + field.slice(1)}
              placeholder={`Masukkan ${field}`}
              required
            />
          ))}

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

export default EditGrafikHasilKepuasan;
