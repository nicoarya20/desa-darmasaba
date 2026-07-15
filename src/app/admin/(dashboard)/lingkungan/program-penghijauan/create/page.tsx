'use client';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import SelectIconProgram from '../../../_com/selectIcon';
import programPenghijauanState from '../../../_state/lingkungan/program-penghijauan';
import { toast } from 'react-toastify';
import { useState } from 'react';

function CreateProgramPenghijauan() {
  const stateCreate = useProxy(programPenghijauanState, { sync: true }); // sync: cegah caret jump di controlled input
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      stateCreate.create.form.name?.trim() !== '' &&
      stateCreate.create.form.icon?.trim() !== '' &&
      stateCreate.create.form.judul?.trim() !== '' &&
      !isHtmlEmpty(stateCreate.create.form.deskripsi)
    );
  };

  const resetForm = () => {
    stateCreate.create.form = {
      name: '',
      deskripsi: '',
      judul: '',
      icon: '',
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await stateCreate.create.create();
      resetForm();
      router.push('/admin/lingkungan/program-penghijauan');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Gagal menambahkan program penghijauan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Tombol back + title */}
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
          Tambah Program Penghijauan
        </Title>
      </Group>

      {/* Form */}
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
            label={<Text fz="sm" fw="bold">Nama Program Penghijauan</Text>}
            placeholder="Masukkan nama program penghijauan"
            value={stateCreate.create.form.name || ''}
            onChange={(e) => (stateCreate.create.form.name = e.target.value)}
            required
          />

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Ikon Program Penghijauan
            </Text>
            <SelectIconProgram
              onChange={(value) => (stateCreate.create.form.icon = value)}
            />
          </Box>

          <TextInput
            label={<Text fz="sm" fw="bold">Judul Deskripsi Program Penghijauan</Text>}
            placeholder="Masukkan judul deskripsi program penghijauan"
            value={stateCreate.create.form.judul || ''}
            onChange={(e) => (stateCreate.create.form.judul = e.target.value)}
            required
          />

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Deskripsi Program Penghijauan
            </Text>
            <CreateEditor
              value={stateCreate.create.form.deskripsi}
              onChange={(htmlContent) =>
                (stateCreate.create.form.deskripsi = htmlContent)
              }
            />
          </Box>

          <Group justify="right" mt="sm">
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

export default CreateProgramPenghijauan;
