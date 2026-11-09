'use client';
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateKategoriBerita() {
  const createState = useProxy(stateDashboardBerita.kategoriBerita, { sync: true }); // sync: cegah caret jump di controlled input
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      createState.create.form.name?.trim() !== ''
    );
  };

  const resetForm = () => {
    createState.create.form = {
      name: '',
    };
  };

  const handleSubmit = async () => {
    if (!createState.create.form.name?.trim()) {
      toast.error('Nama kategori berita wajib diisi');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createState.create.create();
      resetForm();
      router.push('/admin/pemerintahan/berita/kategori-berita');
    } catch (error) {
      console.error('Error creating kategori berita:', error);
      toast.error('Gagal menambahkan kategori berita');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
   <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header dengan back button */}
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
          Tambah Kategori Berita
        </Title>
      </Group>

      {/* Form utama */}
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
            label="Nama Kategori Berita"
            placeholder="Masukkan nama kategori berita"
            value={createState.create.form.name || ''}
            onChange={(e) => (createState.create.form.name = e.target.value)}
            required
          />

          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
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

export default CreateKategoriBerita;
