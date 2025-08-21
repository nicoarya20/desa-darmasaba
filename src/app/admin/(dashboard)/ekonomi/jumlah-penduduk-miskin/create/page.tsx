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
import jumlahPendudukMiskin from '../../../_state/ekonomi/jumlah-penduduk-miskin';

function CreateJumlahPendudukMiskin() {
  const stateJPM = useProxy(jumlahPendudukMiskin);
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter()

  const resetForm = () => {
    stateJPM.create.form = {
      year: 0,
      totalPoorPopulation: 0,
    }
  }

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
    router.push("/admin/ekonomi/jumlah-penduduk-miskin");
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
              label="Tahun"
              type="number"
              value={stateJPM.create.form.year}
              placeholder="Masukkan tahun"
              onChange={(val) => {
                stateJPM.create.form.year = Number(val.currentTarget.value);
              }}
            />
            <TextInput
              label="Jumlah Penduduk Miskin"
              type="number"
              value={stateJPM.create.form.totalPoorPopulation}
              placeholder="Masukkan jumlah penduduk miskin"
              onChange={(val) => {
                stateJPM.create.form.totalPoorPopulation = Number(val.currentTarget.value);
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

export default CreateJumlahPendudukMiskin;
