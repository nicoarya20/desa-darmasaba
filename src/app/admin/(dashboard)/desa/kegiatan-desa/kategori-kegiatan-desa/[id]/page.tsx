/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateDashboardKegiatan from '@/app/admin/(dashboard)/_state/desa/kegiatanDesa';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditKategoriKegiatan() {
  const editState = useProxy(stateDashboardKegiatan.kategoriKegiatan);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ nama: '' });
  const [originalData, setOriginalData] = useState({ nama: '' });

  const isFormValid = () => formData.nama?.trim() !== '';

  useEffect(() => {
    const loadKategori = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        await stateDashboardKegiatan.kategoriKegiatan.update.load(id);
        const nama = stateDashboardKegiatan.kategoriKegiatan.update.form.nama || '';
        setFormData({ nama });
        setOriginalData({ nama });
      } catch (error) {
        console.error('Error loading kategori kegiatan:', error);
        toast.error('Gagal memuat data kategori kegiatan');
      }
    };

    loadKategori();
  }, [params?.id]);

  const handleResetForm = () => {
    setFormData({ nama: originalData.nama });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    if (!formData.nama?.trim()) {
      toast.error('Nama kategori kegiatan wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      editState.update.form = {
        ...editState.update.form,
        nama: formData.nama,
      };

      const success = await editState.update.update();
      if (success) {
        router.push('/admin/desa/kegiatan-desa/kategori-kegiatan-desa');
      }
    } catch (error) {
      console.error('Error updating kategori kegiatan:', error);
      toast.error('Terjadi kesalahan saat memperbarui kategori kegiatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Kategori Kegiatan
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
            label="Nama Kategori Kegiatan"
            placeholder="Masukkan nama kategori kegiatan"
            value={formData.nama}
            onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
            required
          />

          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" size="md" onClick={handleResetForm}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background:
                  !isFormValid() || isSubmitting
                    ? 'linear-gradient(135deg, #cccccc, #eeeeee)'
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

export default EditKategoriKegiatan;
