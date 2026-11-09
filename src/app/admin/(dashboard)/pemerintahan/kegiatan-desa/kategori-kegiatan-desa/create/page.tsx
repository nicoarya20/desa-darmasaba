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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateKategoriKegiatan() {
  const createState = useProxy(stateDashboardKegiatan.kategoriKegiatan, { sync: true }); // sync: cegah caret jump di controlled input
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = () => createState.create.form.nama?.trim() !== '';

  const resetForm = () => {
    createState.create.resetForm();
  };

  const handleSubmit = async () => {
    if (!createState.create.form.nama?.trim()) {
      toast.error('Nama kategori kegiatan wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await createState.create.create();
      if (success) {
        resetForm();
        router.push('/admin/pemerintahan/kegiatan-desa/kategori-kegiatan-desa');
      }
    } catch (error) {
      console.error('Error creating kategori kegiatan:', error);
      toast.error('Gagal menambahkan kategori kegiatan');
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
          Tambah Kategori Kegiatan
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
            value={createState.create.form.nama || ''}
            onChange={(e) => (createState.create.form.nama = e.target.value)}
            required
          />

          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" size="md" onClick={resetForm}>
              Reset
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

export default CreateKategoriKegiatan;
