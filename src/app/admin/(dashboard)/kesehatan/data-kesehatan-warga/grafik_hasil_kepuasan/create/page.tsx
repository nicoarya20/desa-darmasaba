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
      nama: "",
      tanggal: "",
      jenisKelamin: "",
      alamat: "",
      penyakit: "",
    }
  }

  const handleSubmit = async () => {
    await stateGrafikKepuasan.create.create();
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
              label="Nama"
              type="text"
              value={stateGrafikKepuasan.create.form.nama}
              placeholder="Masukkan nama"
              onChange={(val) => {
                stateGrafikKepuasan.create.form.nama = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Tanggal"
              type="date"
              value={stateGrafikKepuasan.create.form.tanggal}
              placeholder="Masukkan tanggal"
              onChange={(val) => {
                stateGrafikKepuasan.create.form.tanggal = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Jenis Kelamin"
              type="text"
              value={stateGrafikKepuasan.create.form.jenisKelamin}
              placeholder="Masukkan jenis kelamin"
              onChange={(val) => {
                stateGrafikKepuasan.create.form.jenisKelamin = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Alamat"
              type="text"
              value={stateGrafikKepuasan.create.form.alamat}
              placeholder="Masukkan alamat"
              onChange={(val) => {
                stateGrafikKepuasan.create.form.alamat = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Penyakit"
              type="text"
              value={stateGrafikKepuasan.create.form.penyakit}
              placeholder="Masukkan penyakit"
              onChange={(val) => {
                stateGrafikKepuasan.create.form.penyakit = val.currentTarget.value;
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
