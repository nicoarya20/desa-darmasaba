/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Box, Button, Group, Paper, Stack, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import colors from '@/con/colors';
import jumlahPendudukMiskin from '../../../_state/ekonomi/jumlah-penduduk-miskin';

export default function CreateJumlahPendudukMiskin() {
  const stateJPM = useProxy(jumlahPendudukMiskin);
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter();

  const resetForm = () => {
    stateJPM.create.form = {
      year: new Date().getFullYear(),
      totalPoorPopulation: 0,
    };
  };

  const handleSubmit = async () => {
    const id = await stateJPM.create.create();
    if (id) {
      const idStr = String(id);
      await stateJPM.findUnique.load(idStr);
      if (stateJPM.findUnique.data) {
        setChartData([stateJPM.findUnique.data]);
      }
    }
    resetForm();
    router.push('/admin/ekonomi/jumlah-penduduk-miskin');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Tambah Jumlah Penduduk Miskin
        </Title>
      </Group>

      {/* Form Paper */}
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
            label="Tahun"
            type="number"
            defaultValue={stateJPM.create.form.year || ''}
            placeholder="Masukkan tahun"
            onChange={(e) => {
              const value = e.currentTarget.value;
              stateJPM.create.form.year = value ? Number(value) : 0;
            }}
            required
          />

          <TextInput
            label="Jumlah Penduduk Miskin"
            type="number"
            defaultValue={stateJPM.create.form.totalPoorPopulation}
            placeholder="Masukkan jumlah penduduk miskin"
            onChange={(e) => {
              stateJPM.create.form.totalPoorPopulation = Number(e.currentTarget.value);
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
