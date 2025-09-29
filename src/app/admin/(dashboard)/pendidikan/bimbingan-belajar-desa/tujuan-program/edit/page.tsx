'use client'
import stateBimbinganBelajarDesa from '@/app/admin/(dashboard)/_state/pendidikan/bimbingan-belajar-desa';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import { toast } from 'react-toastify';

const BimbinganBelajarDesaTextEditor = dynamic(
  () =>
    import('../../_lib/bimbinganBelajarDesaTextEditor').then(
      (mod) => mod.BimbinganBelajarDesaTextEditor
    ),
  { ssr: false }
);

function EditTujuanProgram() {
  const router = useRouter();
  const editState = useProxy(stateBimbinganBelajarDesa.stateTujuanProgram);

  const [judul, setJudul] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // load data once
  useShallowEffect(() => {
    if (!editState.findById.data) {
      editState.findById.initialize();
    }
  }, []);

  useEffect(() => {
    if (editState.findById.data) {
      setJudul(editState.findById.data.judul ?? '');
      setContent(editState.findById.data.deskripsi ?? '');
    }
  }, [editState.findById.data]);

  const handleSubmit = async () => {
    if (!judul.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editState.findById.data) {
        editState.findById.data.judul = judul;
        editState.findById.data.deskripsi = content;
        await editState.update.save(editState.findById.data);

        toast.success('Berhasil menyimpan perubahan');
        router.push('/admin/pendidikan/bimbingan-belajar-desa/tujuan-program');
      }
    } catch (err) {
      console.error('Error saving:', err);
      toast.error('Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => router.back();

  // loading state
  if (editState.findById.loading) {
    return (
      <Box>
        <Center h={400}>
          <Text>Memuat data tujuan program...</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box>
      <Stack gap="xs">
        <Group mb="md">
          <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
            <Button variant="subtle" onClick={handleBack} p="xs" radius="md">
              <IconArrowBack color={colors['blue-button']} size={24} />
            </Button>
          </Tooltip>
          <Title order={4} ml="sm" c="dark">
            Edit Tujuan Program
          </Title>
        </Group>

        <Paper
          w={{ base: '100%', md: '50%' }}
          bg={colors['white-1']}
          p="md"
          radius="md"
          shadow="sm"
          style={{ border: '1px solid #e0e0e0' }}
        >
          <Stack gap="xs">
            <Title order={3}>Form Edit Tujuan Program</Title>

            {/* Judul Field */}
            <TextInput
              label={<Text fw="bold">Judul</Text>}
              placeholder="Masukkan judul program"
              defaultValue={judul}
              onChange={(e) => setJudul(e.currentTarget.value)}
              error={!judul && 'Judul wajib diisi'}
            />

            {/* Deskripsi Field */}
            <Box>
              <Text fz="sm" fw="bold" mb="xs">Deskripsi</Text>
              <BimbinganBelajarDesaTextEditor
                showSubmit={false}
                onChange={setContent}
                initialContent={content}
              />
            </Box>

            {/* Submit & Cancel */}
            <Group>
              <Button
                bg={colors['blue-button']}
                onClick={handleSubmit}
                loading={isSubmitting || editState.update.loading}
                disabled={!judul}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>

              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting || editState.update.loading}
              >
                Batal
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default EditTujuanProgram;
