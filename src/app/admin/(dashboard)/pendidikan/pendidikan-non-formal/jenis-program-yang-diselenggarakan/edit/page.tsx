'use client'
import pendidikanNonFormalState from '@/app/admin/(dashboard)/_state/pendidikan/pendidikan-non-formal';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

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

  const [formData, setFormData] = useState({ judul: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalData, setOriginalData] = useState({ judul: '', content: '' });

  // Load data pertama kali
  useShallowEffect(() => {
    if (!editState.findById.data) {
      editState.findById.initialize();
    }
  }, []);

  // Sync state lokal dengan data hasil fetch
  useEffect(() => {
    if (editState.findById.data) {
      setFormData({
        judul: editState.findById.data.judul ?? '',
        content: editState.findById.data.deskripsi ?? '',
      });
      setOriginalData({
        judul: editState.findById.data.judul ?? '',
        content: editState.findById.data.deskripsi ?? '',
      });
    }
  }, [editState.findById.data]);

  const handleChange = (field: 'judul' | 'content', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      judul: originalData.judul,
      content: originalData.content,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    if (!formData.judul.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editState.findById.data) {
        const updatedData = {
          ...editState.findById.data,
          judul: formData.judul,
          deskripsi: formData.content,
        };

        await editState.update.save(updatedData);
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
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Stack gap="xs">
        {/* Back Button + Title */}
        <Group mb="md">
          <Button variant="subtle" onClick={handleBack} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={22} />
          </Button>
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
              value={formData.judul}
              onChange={(e) => handleChange('judul', e.currentTarget.value)}
              error={!formData.judul && 'Judul wajib diisi'}
            />

            <Box>
              <Text fz="sm" fw="bold" mb="xs">Deskripsi</Text>
              <JenisProgramYangDiselenggarakanTextEditor
                showSubmit={false}
                onChange={(value: string) => handleChange('content', value)}
                initialContent={formData.content}
              />
            </Box>

            <Group justify="right">
            {/* Tombol Batal */}
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
      </Stack>
    </Box>
  );
}

export default EditJenisProgramYangDiselenggarakan;
