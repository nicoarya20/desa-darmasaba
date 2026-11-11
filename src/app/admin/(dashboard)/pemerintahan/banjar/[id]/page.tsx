/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import stateBanjar from '@/app/admin/(dashboard)/_state/desa/banjar';
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

function EditBanjar() {
  const state = useProxy(stateBanjar);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalName, setOriginalName] = useState('');
  const [formData, setFormData] = useState({ name: '' });

  const isFormValid = () => formData.name?.trim() !== '';

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;

    state.update.load(id).then((data) => {
      if (data) {
        setFormData({ name: data.name });
        setOriginalName(data.name);
      } else {
        toast.error('Gagal memuat data banjar');
      }
    });
  }, [params?.id]);

  const handleResetForm = () => {
    setFormData({ name: originalName });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      toast.error('Nama banjar wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      state.update.form = { name: formData.name };
      await state.update.update();
      router.push('/admin/pemerintahan/banjar');
    } catch (error) {
      console.error('Error updating banjar:', error);
      toast.error('Terjadi kesalahan saat memperbarui banjar');
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
        <Title order={4} ml="sm" c="dark">Edit Banjar</Title>
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
            name="name"
            label="Nama Banjar"
            placeholder="Masukkan nama banjar"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
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

export default EditBanjar;
