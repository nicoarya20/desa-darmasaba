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
  Select,
  Stack,
  TextInput,
  Title
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
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

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.nama?.trim() !== '' &&
      formData.tanggal !== '' &&
      formData.jenisKelamin?.trim() !== '' &&
      formData.alamat?.trim() !== '' &&
      formData.penyakit?.trim() !== ''
    );
  };

  const [formData, setFormData] = useState({
    nama: '',
    tanggal: '',
    jenisKelamin: '',
    alamat: '',
    penyakit: '',
    banjarId: '',
  });

  const [originalData, setOriginalData] = useState({
    nama: '',
    tanggal: '',
    jenisKelamin: '',
    alamat: '',
    penyakit: '',
    banjarId: '',
  });

  useShallowEffect(() => {
    editState.banjarList.load();
  }, []);

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
            banjarId: data.banjarId || '',
          });

          setOriginalData({
            nama: data.nama || '',
            tanggal: formattedTanggal,
            jenisKelamin: data.jenisKelamin || '',
            alamat: data.alamat || '',
            penyakit: data.penyakit || '',
            banjarId: data.banjarId || '',
          });
        }
      } catch (err) {
        console.error("Error loading penderita penyakit:", err);
        toast.error("Gagal memuat data penderita penyakit");
      }
    };

    loadData();
  }, [params?.id]);

  // Generic handler for controlled inputs
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    setFormData({ ...originalData });
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

    if (!formData.penyakit?.trim()) {
      toast.error('Penyakit wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      editState.update.form = { ...editState.update.form, ...formData };
      await editState.update.submit();
      toast.success('penderita penyakit berhasil diperbarui!');
      router.push('/admin/kesehatan/data-kesehatan-warga/penderita_penyakit');
    } catch (err) {
      console.error('Error updating penderita penyakit:', err);
      toast.error('Terjadi kesalahan saat memperbarui penderita penyakit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
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
          Edit Penderita Penyakit
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
          <Select
            label="Banjar"
            placeholder="Pilih banjar (opsional)"
            data={editState.banjarList.data.map((b) => ({ value: b.id, label: b.name }))}
            value={formData.banjarId || null}
            onChange={(val) => handleChange('banjarId', val ?? '')}
            clearable
            searchable
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

export default EditGrafikHasilKepuasan;
