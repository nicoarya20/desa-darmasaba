/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import dataPendidikan from '../../../_state/pendidikan/data-pendidikan';

function CreateDataPendidikan() {
  const stateDPM = useProxy(dataPendidikan);
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter()

  const resetForm = () => {
    stateDPM.create.form = {
      name: "",
      jumlah: "",
    }
  }

  const handleSubmit = async () => {
    const id = await stateDPM.create.create();
    if (id) {
      const idStr = String(id);
      await stateDPM.findUnique.load(idStr);
      if (stateDPM.findUnique.data) {
        setChartData([stateDPM.findUnique.data]);
      }
    }
    resetForm();
    router.push("/admin/pendidikan/data-pendidikan");
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
          <Title order={4}>Tambah Data Pendidikan</Title>
          <Stack gap={"xs"}>
            <TextInput
              label="Nama"
              type="text"
              value={stateDPM.create.form.name}
              placeholder="Masukkan nama"
              onChange={(val) => {
                stateDPM.create.form.name = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Jumlah"
              type="number"
              value={stateDPM.create.form.jumlah}
              placeholder="Masukkan jumlah"
              onChange={(val) => {
                stateDPM.create.form.jumlah = val.currentTarget.value;
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

export default CreateDataPendidikan;
