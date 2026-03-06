/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import potensiDesaState from '@/app/admin/(dashboard)/_state/desa/potensi';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  TextInput,
  Title,
  Loader
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditKategoriPotensi() {
  const editState = useProxy(potensiDesaState.kategoriPotensi);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    nama: '',
  });

  const [originalData, setOriginalData] = useState({
    nama: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.nama?.trim() !== ''
    );
  };

  // Load data dari backend -> isi ke formData lokal
  useEffect(() => {
    const loadKategori = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await editState.update.load(id);
        if (data) {
          setFormData({
            nama: data.nama || '',
          });
          setOriginalData({
            nama: data.nama || '',
          });
        }
      } catch (error) {
        console.error('Error loading kategori potensi:', error);
        toast.error('Gagal memuat data kategori potensi');
      }
    };

    loadKategori();
  }, [params?.id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    if (!formData.nama?.trim()) {
      toast.error('Nama kategori potensi wajib diisi');
      return;
    }
    
    try {
      setIsSubmitting(true);
      // Update global state hanya pas submit
      editState.update.form = {
        ...editState.update.form,
        nama: formData.nama,
      };

      await editState.update.update();
      toast.success('Kategori Potensi berhasil diperbarui!');
      router.push('/admin/desa/potensi/kategori-potensi');
    } catch (error) {
      console.error('Error updating kategori potensi:', error);
      toast.error('Terjadi kesalahan saat memperbarui kategori potensi');
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
          Edit Kategori Potensi
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
            label="Nama Kategori Potensi"
            placeholder="Masukkan nama kategori potensi"
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.currentTarget.value)}
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

export default EditKategoriPotensi;
