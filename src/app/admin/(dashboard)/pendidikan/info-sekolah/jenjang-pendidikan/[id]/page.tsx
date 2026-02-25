/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
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

function EditJenjangPendidikan() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const stateJenjang = useProxy(infoSekolahPaud.jenjangPendidikan);

  const [formData, setFormData] = useState({ nama: '' });
  const [originalData, setOriginalData] = useState({ nama: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if form is valid
  const isFormValid = () => {
    return formData.nama?.trim() !== '';
  };

  // Load data sekali saat component mount
  useEffect(() => {
    if (!id) return;

    const loadJenjang = async () => {
      try {
        const data = await stateJenjang.edit.load(id);
        if (data) {
          stateJenjang.edit.id = id; // tetap simpan di global state
          setFormData({ nama: data.nama || '' });
          setOriginalData({ nama: data.nama || '' });
        }
      } catch (error) {
        console.error('Error loading jenjang pendidikan:', error);
        toast.error('Gagal memuat data jenjang pendidikan');
      } finally {
        setLoading(false);
      }
    };

    loadJenjang();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.nama.trim()) {
      toast.error('Nama jenjang pendidikan tidak boleh kosong');
      return;
    }

    try {
      setIsSubmitting(true);
      stateJenjang.edit.form = { nama: formData.nama.trim() };
      if (!stateJenjang.edit.id) stateJenjang.edit.id = id;

      const success = await stateJenjang.edit.update();
      if (success) {
        toast.success('Jenjang pendidikan berhasil diperbarui!');
        router.push('/admin/pendidikan/info-sekolah/jenjang-pendidikan');
      }
    } catch (error) {
      console.error('Error updating jenjang pendidikan:', error);
      toast.error('Terjadi kesalahan saat memperbarui jenjang pendidikan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  return (
   <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Jenjang Pendidikan
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
            label="Nama Jenjang Pendidikan"
            placeholder="Masukkan nama jenjang pendidikan"
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            required
            disabled={loading}
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

export default EditJenjangPendidikan;
