/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import grafikkepuasan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/grafikKepuasan';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function CreateGrafikHasilKepuasanMasyarakat() {
  const stateGrafikKepuasan = useProxy(grafikkepuasan);
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter()

  const resetForm = () => {
    stateGrafikKepuasan.create.form = {
      label: "",
      jumlah: "",
    }
  }

  const handleSubmit = async () => {
    const id = await stateGrafikKepuasan.create.create();
    if (id) {
      const idStr = String(id);
      await stateGrafikKepuasan.findUnique.load(idStr);
      if (stateGrafikKepuasan.findUnique.data) {
        setChartData([stateGrafikKepuasan.findUnique.data]);
      }
    }
    resetForm();
    router.push("/admin/kesehatan/data-kesehatan-warga/grafik_hasil_kepuasan");
  }
  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack size={20} />
        </Button>
      </Box>
      <Box>
        <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
          <Title order={4}>Tambah Grafik Hasil Kepuasan Masyarakat</Title>
          <Stack gap={"xs"}>
            <TextInput
              label="Label"
              type="text"
              value={stateGrafikKepuasan.create.form.label}
              placeholder="Masukkan label"
              onChange={(val) => {
                stateGrafikKepuasan.create.form.label = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Jumlah"
              type="number"
              value={stateGrafikKepuasan.create.form.jumlah}
              placeholder="Masukkan jumlah"
              onChange={(val) => {
                stateGrafikKepuasan.create.form.jumlah = val.currentTarget.value;
              }}
            />
            <Group>
              <Button
                bg={colors['blue-button']}
                mt={10}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default CreateGrafikHasilKepuasanMasyarakat;
