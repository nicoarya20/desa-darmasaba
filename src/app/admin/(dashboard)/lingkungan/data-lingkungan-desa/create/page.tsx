'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import SelectIconProgram from '../../../_com/selectIcon';
import dataLingkunganDesaState from '../../../_state/lingkungan/data-lingkungan-desa';

function CreateDataLingkunganDesa() {
  const stateCreate = useProxy(dataLingkunganDesaState);
  const router = useRouter();

  const resetForm = () => {
    stateCreate.create.form = {
      name: '',
      deskripsi: '',
      jumlah: '',
      icon: '',
    };
  };

  const handleSubmit = async () => {
    await stateCreate.create.create();
    resetForm();
    router.push('/admin/lingkungan/data-lingkungan-desa');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button
            variant="subtle"
            onClick={() => router.back()}
            p="xs"
            radius="md"
          >
            <IconArrowBack color={colors['blue-button']} size={22} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Tambah Data Lingkungan Desa
        </Title>
      </Group>

      {/* Card Form */}
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
            label={<Text fw="bold" fz="sm">Nama Data Lingkungan Desa</Text>}
            placeholder="Masukkan nama data lingkungan desa"
            defaultValue={stateCreate.create.form.name || ''}
            onChange={(val) => (stateCreate.create.form.name = val.target.value)}
            required
          />

          <Box>
            <Text fz="sm" fw="bold" mb={6}>
              Ikon Data Lingkungan Desa
            </Text>
            <SelectIconProgram
              onChange={(value) => (stateCreate.create.form.icon = value)}
            />
          </Box>

          <TextInput
            label={<Text fw="bold" fz="sm">Jumlah Data Lingkungan Desa</Text>}
            placeholder="Masukkan jumlah data lingkungan desa"
            defaultValue={stateCreate.create.form.jumlah || ''}
            onChange={(e) => (stateCreate.create.form.jumlah = e.currentTarget.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi Data Lingkungan Desa
            </Text>
            <CreateEditor
              value={stateCreate.create.form.deskripsi}
              onChange={(htmlContent) =>
                (stateCreate.create.form.deskripsi = htmlContent)
              }
            />
          </Box>

          {/* Submit Button */}
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

export default CreateDataLingkunganDesa;
