/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import demografiPekerjaan from '../../../_state/ekonomi/demografi-pekerjaan';

function CreateDemografiPekerjaan() {
  const stateDemografi = useProxy(demografiPekerjaan);
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter()

  const resetForm = () => {
    stateDemografi.create.form = {
      pekerjaan: "",
      lakiLaki: 0,
      perempuan: 0,
    }
  }

  const handleSubmit = async () => {
    const id = await stateDemografi.create.create();
    if (id) {
      const idStr = String(id);
      await stateDemografi.findUnique.load(idStr);
      if (stateDemografi.findUnique.data) {
        setChartData([stateDemografi.findUnique.data]);
      }
    }
    resetForm();
    router.push("/admin/ekonomi/demografi-pekerjaan");
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
          <Title order={4}>Tambah Demografi Pekerjaan</Title>
          <Stack gap={"xs"}>
            <TextInput
              label="Pekerjaan"
              type="text"
              value={stateDemografi.create.form.pekerjaan}
              placeholder="Masukkan pekerjaan"
              onChange={(val) => {
                stateDemografi.create.form.pekerjaan = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Jumlah Pekerja Laki - Laki"
              type="number"
              value={stateDemografi.create.form.lakiLaki}
              placeholder="Masukkan jumlah pekerja laki - laki"
              onChange={(val) => {
                stateDemografi.create.form.lakiLaki = Number(val.currentTarget.value);
              }}
            />
            <TextInput
              label="Jumlah Pekerja Perempuan"
              type="number"
              value={stateDemografi.create.form.perempuan}
              placeholder="Masukkan jumlah pekerja perempuan"
              onChange={(val) => {
                stateDemografi.create.form.perempuan = Number(val.currentTarget.value);
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

export default CreateDemografiPekerjaan;
