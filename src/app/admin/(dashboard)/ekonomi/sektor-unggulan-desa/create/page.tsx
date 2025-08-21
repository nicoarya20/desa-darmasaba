/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import grafikSektorUnggulan from '../../../_state/ekonomi/sektor-unggulan-desa';
import CreateEditor from '../../../_com/createEditor';

function CreateSektorUnggulanDesa() {
  const stateGrafik = useProxy(grafikSektorUnggulan);
  const [chartData, setChartData] = useState<any[]>([]);
  const router = useRouter()

  const resetForm = () => {
    stateGrafik.create.form = {
      name: "",
      description: "",
      value: 0,
    }
  }

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
    router.push("/admin/ekonomi/sektor-unggulan-desa");
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
              label="Nama Sektor Unggulan"
              type="text"
              value={stateGrafik.create.form.name}
              placeholder="Masukkan nama sektor unggulan"
              onChange={(val) => {
                stateGrafik.create.form.name = val.currentTarget.value;
              }}
            />
            <Box>
              <Text fw={"bold"} fz={"sm"}>Deskripsi Sektor Ungggulan</Text>
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
              value={stateGrafik.create.form.value}
              placeholder="Masukkan jumlah"
              onChange={(val) => {
                stateGrafik.create.form.value = Number(val.currentTarget.value);
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

export default CreateSektorUnggulanDesa;
