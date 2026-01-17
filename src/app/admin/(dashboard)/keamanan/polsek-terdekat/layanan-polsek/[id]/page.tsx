/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import statePolsekTerdekat from '@/app/admin/(dashboard)/_state/keamanan/polsek-terdekat';
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

function EditLayananPolsek() {
  const editState = useProxy(statePolsekTerdekat.layananPolsek);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [originalData, setOriginalData] = useState({
    nama: '',
  });

  const [formData, setFormData] = useState({
    nama: '',
  });

  useEffect(() => {
    const loadLayananPolsek = async () => {
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
        console.error('Error loading layanan polsek:', error);
        toast.error('Gagal memuat data layanan polsek');
      }
    };

    loadLayananPolsek();
  }, [params?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // update global state hanya saat submit
      editState.update.form = {
        ...editState.update.form,
        nama: formData.nama,
      };

      await editState.update.update();
      toast.success('Layanan Polsek berhasil diperbarui!');
      router.push('/admin/keamanan/polsek-terdekat/layanan-polsek');
    } catch (error) {
      console.error('Error updating layanan polsek:', error);
      toast.error('Terjadi kesalahan saat memperbarui layanan polsek');
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
          Edit Layanan Polsek
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
            name="nama"
            label="Nama Layanan Polsek"
            placeholder="Masukkan nama layanan polsek"
            value={formData.nama}
            onChange={handleChange}
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

export default EditLayananPolsek;
