/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
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
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditAjukanPermohonan() {
  const router = useRouter();
  const params = useParams();
  const stateAjukan = useProxy(stateLayananDesa.ajukanPermohonan);
  // Snapshot cabang suratKeterangan agar Select kategori re-render saat
  // findManyAll.load() async selesai — JSX sebelumnya baca raw proxy (race).
  const stateSurat = useProxy(stateLayananDesa.suratKeterangan);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [originalData, setOriginalData] = useState({
    nama: "",
    nik: "",
    alamat: "",
    nomorKk: "",
    kategoriId: "",
  });

  // State lokal form
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    alamat: '',
    nomorKk: '',
    kategoriId: '',
  });

  // Load data awal
  useEffect(() => {
    stateLayananDesa.suratKeterangan.findManyAll.load();

    const loadAjukan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateAjukan.edit.load(id);
        if (data) {
          setFormData({
            nama: data.nama || '',
            nik: data.nik || '',
            alamat: data.alamat || '',
            nomorKk: data.nomorKk || '',
            kategoriId: data.kategoriId || '',
          });
          setOriginalData({
            nama: data.nama || '',
            nik: data.nik || '',
            alamat: data.alamat || '',
            nomorKk: data.nomorKk || '',
            kategoriId: data.kategoriId || '',
          });
        }
      } catch (error) {
        console.error('Error loading ajukan:', error);
        toast.error('Gagal memuat data ajukan');
      }
    };

    loadAjukan();
  }, [params?.id]);

  // Handler untuk input controlled
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
      nik: originalData.nik,
      alamat: originalData.alamat,
      nomorKk: originalData.nomorKk,
      kategoriId: originalData.kategoriId,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      stateAjukan.edit.form = {
        ...stateAjukan.edit.form,
        ...formData,
      };
      toast.success('Ajukan berhasil diperbarui!');
      router.push('/admin/pemerintahan/layanan/ajukan_permohonan');
    } catch (error) {
      console.error('Error updating ajukan:', error);
      toast.error('Terjadi kesalahan saat memperbarui ajukan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Back Button */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Ajukan Permohonan
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
            label="Nama"
            placeholder="Masukkan nama"
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            required
          />

          <TextInput
            inputMode="numeric"
            maxLength={16}
            label="NIK"
            placeholder="Masukkan NIK"
            value={formData.nik}
            onChange={(e) => handleChange('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
            required
          />

          <TextInput
            label="Alamat"
            placeholder="Masukkan alamat"
            value={formData.alamat}
            onChange={(e) => handleChange('alamat', e.target.value)}
            required
          />

          <TextInput
            label="Nomor KK"
            placeholder="Masukkan nomor KK"
            inputMode="numeric"
            maxLength={16}
            value={formData.nomorKk}
            onChange={(e) => handleChange('nomorKk', e.target.value.replace(/\D/g, '').slice(0, 16))}
            required
          />

          <Select
            label="Kategori"
            placeholder="Pilih kategori"
            data={stateSurat.findManyAll.data?.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
            value={formData.kategoriId || null}
            onChange={(val) => handleChange('kategoriId', val || '')}
            searchable
            clearable
            nothingFoundMessage="Tidak ditemukan"
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

export default EditAjukanPermohonan;
