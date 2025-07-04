/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import programKemiskinanState from '../../../_state/ekonomi/program-kemiskinan';
import CreateEditor from '../../../_com/createEditor';
import { useState } from 'react';


function CreateProgramKemiskinan() {
  const programState = useProxy(programKemiskinanState)
  const router = useRouter();
  const [lineChart, setLineChart] = useState<any[]>([]);

  const resetForm = () => {
    programState.create.form = {
      nama: "",
      deskripsi: "",
      ikonUrl: "",
      statistik: {
        tahun: "",
        jumlah: "",
      }
    }
  }

  const handleSubmit = async () => {
    const id = await programState.create.create();
    if (id) {
      const idStr = String(id);
      await programState.findUnique.load(idStr);
      if (programState.findUnique.data) {
        setLineChart([programState.findUnique.data]);
      }
    }
    resetForm()
    router.push("/admin/ekonomi/program-kemiskinan")
  }

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Create Program Kemiskinan</Title>
          <TextInput
            value={programState.create.form.nama}
            onChange={(val) => {
              programState.create.form.nama = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"md"}>Judul Program</Text>}
            placeholder='Masukkan judul program'
          />
         <Box>
          <Text fw={"bold"} fz={"md"}>Deskripsi</Text>
         <CreateEditor
            value={programState.create.form.deskripsi}
            onChange={(val) => {
              programState.create.form.deskripsi = val;
            }}
          />
         </Box>
          <TextInput
            value={programState.create.form.ikonUrl}
            onChange={(val) => {
              programState.create.form.ikonUrl = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"md"}>Ikon URL</Text>}
            placeholder='Masukkan ikon url'
          />
          <Text fw={"bold"} fz={"md"}>Statistik Jumlah Masyarakat Miskin</Text>
          <TextInput
            type='number'
            value={programState.create.form.statistik.jumlah}
            onChange={(val) => {
              programState.create.form.statistik.jumlah = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"md"}>Jumlah Masyarakat Miskin</Text>}
            placeholder='Masukkan jumlah masyarakat miskin'
          />
          <TextInput
            type='number'
            value={programState.create.form.statistik.tahun}
            onChange={(val) => {
              programState.create.form.statistik.tahun = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"md"}>Tahun</Text>}
            placeholder='Masukkan tahun'
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateProgramKemiskinan;
