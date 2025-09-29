/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Title,
  Tooltip,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import grafikSektorUnggulan from '../../../_state/ekonomi/sektor-unggulan-desa';
import CreateEditor from '../../../_com/createEditor';

function CreateSektorUnggulanDesa() {
  const stateGrafik = useProxy(grafikSektorUnggulan);
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter();

  const resetForm = () => {
    stateGrafik.create.form = {
      name: '',
      description: '',
      value: 0,
    };
  };

  const handleSubmit = async () => {
    const id = await stateGrafik.create.create();
    if (id) {
      const idStr = String(id);
      await stateGrafik.findUnique.load(idStr);
      if (stateGrafik.findUnique.data) {
        setChartData([stateGrafik.findUnique.data]);
      }
    }
    resetForm();
    router.push('/admin/ekonomi/sektor-unggulan-desa');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header dengan back button */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button
            variant="subtle"
            onClick={() => router.back()}
            p="xs"
            radius="md"
          >
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Tambah Sektor Unggulan Desa
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
            label="Nama Sektor Unggulan"
            placeholder="Masukkan nama sektor unggulan"
            defaultValue={stateGrafik.create.form.name}
            onChange={(e) => {
              stateGrafik.create.form.name = e.currentTarget.value;
            }}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi Sektor Unggulan
            </Text>
            <CreateEditor
              value={stateGrafik.create.form.description}
              onChange={(val) => {
                stateGrafik.create.form.description = val;
              }}
            />
          </Box>

          <TextInput
            label="Jumlah"
            type="number"
            placeholder="Masukkan jumlah"
            defaultValue={stateGrafik.create.form.value}
            onChange={(e) => {
              stateGrafik.create.form.value = Number(e.currentTarget.value);
            }}
            required
          />

          <Group justify="right">
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

export default CreateSektorUnggulanDesa;
