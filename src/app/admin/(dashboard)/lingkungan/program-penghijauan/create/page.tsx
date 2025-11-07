'use client';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
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

function CreateProgramPenghijauan() {
  const stateCreate = useProxy(programPenghijauanState);
  const router = useRouter();

  const resetForm = () => {
    stateCreate.create.form = {
      name: '',
      deskripsi: '',
      judul: '',
      icon: '',
    };
  };

  const handleSubmit = async () => {
    await stateCreate.create.create();
    resetForm();
    router.push('/admin/lingkungan/program-penghijauan');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
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
            defaultValue={stateCreate.create.form.name || ''}
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
            defaultValue={stateCreate.create.form.judul || ''}
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
              onClick={handleSubmit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateProgramPenghijauan;
