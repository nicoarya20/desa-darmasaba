'use client'

import stateProgramPendidikanAnak from '@/app/admin/(dashboard)/_state/pendidikan/program-pendidikan-anak';
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
  Tooltip
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

const ProgramPendidikanAnakTextEditor = dynamic(
  () =>
    import('../../_lib/programPendidikanAnakTextEditor').then(
      (mod) => mod.ProgramPendidikanAnakTextEditor
    ),
  { ssr: false }
);

interface FormData {
  judul: string;
  deskripsi: string;
}

function EditTujuanProgram() {
  const router = useRouter();
  const editState = useProxy(stateProgramPendidikanAnak.programUnggulanState);

  // lokal state form
  const [formData, setFormData] = useState<FormData>({
    judul: '',
    deskripsi: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // load data once
  useShallowEffect(() => {
    if (!editState.findById.data) editState.findById.initialize();
  }, []);

  // populate formData saat data global tersedia
  useEffect(() => {
    if (editState.findById.data) {
      setFormData({
        judul: editState.findById.data.judul ?? '',
        deskripsi: editState.findById.data.deskripsi ?? ''
      });
    }
  }, [editState.findById.data]);

  const handleChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = async () => {
    if (!formData.judul.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editState.findById.data) {
        // update global state only on submit
        const updatedData = {
          ...editState.findById.data,
          judul: formData.judul,
          deskripsi: formData.deskripsi
        };
        await editState.update.save(updatedData);

        toast.success('Berhasil menyimpan perubahan');
        router.push('/admin/pendidikan/program-pendidikan-anak/program-unggulan');
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
          <Text>Memuat data program unggulan...</Text>
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
            Edit Program Unggulan
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
            <Title order={3}>Edit Tujuan Program</Title>

            {/* Judul Field */}
            <TextInput
              label={<Text fw="bold">Judul</Text>}
              placeholder="Masukkan judul program"
              value={formData.judul}
              onChange={(e) => handleChange('judul', e.currentTarget.value)}
              error={!formData.judul && 'Judul wajib diisi'}
            />

            {/* Deskripsi Field */}
            <Box>
              <Text fz="sm" fw="bold" mb="xs">
                Deskripsi
              </Text>
              <ProgramPendidikanAnakTextEditor
                showSubmit={false}
                onChange={(value) => handleChange('deskripsi', value)}
                initialContent={formData.deskripsi}
              />
            </Box>

            {/* Submit & Cancel */}
            <Group>
              <Button
                bg={colors['blue-button']}
                onClick={handleSubmit}
                loading={isSubmitting || editState.update.loading}
                disabled={!formData.judul}
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
