'use client'
import pendidikanNonFormalState from '@/app/admin/(dashboard)/_state/pendidikan/pendidikan-non-formal';
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

const JenisProgramYangDiselenggarakanTextEditor = dynamic(
  () =>
    import('../../_lib/pendidikanNonFormalTextEditor').then(
      (mod) => mod.PendidikanNonFormalTextEditor
    ),
  { ssr: false }
);

function EditJenisProgramYangDiselenggarakan() {
  const router = useRouter();
  const editState = useProxy(pendidikanNonFormalState.stateJenisProgram);

  const [judul, setJudul] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data pertama kali
  useShallowEffect(() => {
    if (!editState.findById.data) {
      editState.findById.initialize();
    }
  }, []);

  // Sync state dengan data hasil fetch
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
        router.push(
          '/admin/pendidikan/pendidikan-non-formal/jenis-program-yang-diselenggarakan'
        );
      }
    } catch (err) {
      console.error('Error saving:', err);
      toast.error('Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => router.back();

  if (editState.findById.loading) {
    return (
      <Box>
        <Center h={400}>
          <Text>Memuat data jenis program...</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box>
      <Stack gap="xs">
        {/* Back Button + Title */}
        <Group mb="md">
          <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
            <Button variant="subtle" onClick={handleBack} p="xs" radius="md">
              <IconArrowBack color={colors['blue-button']} size={22} />
            </Button>
          </Tooltip>
          <Title order={4} ml="sm" c="dark">
            Edit Jenis Program Yang Diselenggarakan
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
            <TextInput
              label={<Text fz="sm" fw="bold">Judul</Text>}
              placeholder="Masukkan judul program"
              value={judul}
              onChange={(e) => setJudul(e.currentTarget.value)}
              error={!judul && 'Judul wajib diisi'}
            />

            <Box>
              <Text fz="sm" fw="bold" mb="xs">Deskripsi</Text>
              <JenisProgramYangDiselenggarakanTextEditor
                showSubmit={false}
                onChange={setContent}
                initialContent={content}
              />
            </Box>

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

export default EditJenisProgramYangDiselenggarakan;
