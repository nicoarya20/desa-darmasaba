'use client'
import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';
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
import { useProxy } from 'valtio/utils';
import { useState } from 'react';
import { toast } from 'react-toastify';

function CreateKategoriPengumuman() {
  const createState = useProxy(stateDesaPengumuman.category);
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
      toast.error('Nama kategori pengumuman wajib diisi');
      return;
    }
    
    try {
      await createState.create.create();
      resetForm();
      router.push('/admin/desa/pengumuman/kategori-pengumuman');
    } catch (error) {
      console.error(error);
      toast.error('Gagal menambahkan kategori pengumuman');
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
          Tambah Kategori Pengumuman
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
            label="Nama Kategori Pengumuman"
            placeholder="Masukkan nama kategori pengumuman"
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

export default CreateKategoriPengumuman;
