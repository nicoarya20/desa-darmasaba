'use client';

import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Loader
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreatePengumuman() {
  const pengumumanState = useProxy(stateDesaPengumuman);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useShallowEffect(() => {
    pengumumanState.category.findMany.load();
  }, []);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await pengumumanState.pengumuman.create.create();
      resetForm();
      router.push('/admin/desa/pengumuman/list-pengumuman');
    } catch (error) {
      console.error('Error creating pengumuman:', error);
      toast.error('Terjadi kesalahan saat membuat pengumuman');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    pengumumanState.pengumuman.create.form = {
      judul: '',
      deskripsi: '',
      content: '',
      categoryPengumumanId: '',
    };
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Pengumuman
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
          {/* Judul */}
          <TextInput
            value={pengumumanState.pengumuman.create.form.judul}
            onChange={(val) => (pengumumanState.pengumuman.create.form.judul = val.target.value)}
            label="Judul"
            placeholder="Masukkan judul pengumuman"
            required
          />

          {/* Kategori */}
          <Select
            label="Kategori"
            placeholder="Pilih kategori"
            data={pengumumanState.category.findMany.data?.map((item) => ({
              label: item.name,
              value: item.id,
            })) || []}
            value={pengumumanState.pengumuman.create.form.categoryPengumumanId || null}
            onChange={(val: string | null) => {
              if (val) {
                const selected = pengumumanState.category.findMany.data?.find(
                  (item) => item.id === val
                );
                if (selected) {
                  pengumumanState.pengumuman.create.form.categoryPengumumanId = selected.id;
                }
              } else {
                pengumumanState.pengumuman.create.form.categoryPengumumanId = '';
              }
            }}
            searchable
            clearable
            nothingFoundMessage="Tidak ditemukan"
            required
          />

          {/* Deskripsi Singkat */}
          <TextInput
            value={pengumumanState.pengumuman.create.form.deskripsi}
            onChange={(val) => (pengumumanState.pengumuman.create.form.deskripsi = val.target.value)}
            label="Deskripsi Singkat"
            placeholder="Masukkan deskripsi singkat"
            required
          />

          {/* Konten Editor */}
          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Konten Lengkap
            </Text>
            <CreateEditor
              value={pengumumanState.pengumuman.create.form.content}
              onChange={(htmlContent) => {
                pengumumanState.pengumuman.create.form.content = htmlContent;
              }}
            />
          </Box>

          {/* Tombol Submit */}
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

export default CreatePengumuman;
