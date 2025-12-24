/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import layananonlineDesa from '@/app/admin/(dashboard)/_state/inovasi/layanan-online-desa';
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

function EditJenisPengaduan() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const state = useProxy(layananonlineDesa.jenisPengaduan);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
  });

  const [originalData, setOriginalData] = useState({
    nama: '',
  });

  // Load data sekali aja
  useEffect(() => {
    const loadJenisPengaduan = async () => {
      if (!id) return;

      try {
        const data = await state.edit.load(id);

        if (data) {
          state.edit.id = id; // inject id ke state global (hanya sekali)
          setFormData({
            nama: data.nama || '',
          });
          setOriginalData({
            nama: data.nama || '',
          });
        }
      } catch (error) {
        console.error('Error loading jenis pengaduan:', error);
        toast.error('Gagal memuat data jenis pengaduan');
      }
    };

    loadJenisPengaduan();
  }, [id]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    if (!formData.nama.trim()) {
      toast.error('Nama jenis pengaduan tidak boleh kosong');
      return;
    }

    // Update ke global state HANYA pas submit
    state.edit.form = {
      nama: formData.nama.trim(),
    };

    // Safety fallback kalau ID belum ada
    if (!state.edit.id) {
      state.edit.id = id;
    }

    try {
      setIsSubmitting(true);
      const success = await state.edit.update();

      if (success) {
        router.push('/admin/inovasi/layanan-online-desa/jenis-pengaduan');
      }
    } catch (error) {
      console.error('Error updating jenis pengaduan:', error);
      // toast ditangani di dalam state.update
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
          Edit Jenis Pengaduan
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
            label="Nama Jenis Pengaduan"
            placeholder="Masukkan nama jenis pengaduan"
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

export default EditJenisPengaduan;
