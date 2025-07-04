'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import laporanPublikState from '../../../_state/keamanan/laporan-publik';
export type Status = "Selesai" | "Proses" | "Gagal";

function CreateLaporanPublik() {
  const stateLaporan = useProxy(laporanPublikState)
  const router = useRouter();

  const resetForm = () => {
    stateLaporan.create.form = {
      judul: "",
      lokasi: "",
      tanggalWaktu: "",
      status: "Proses" as Status,
      penanganan: "",
      kronologi: "",
    }
  }

  const handleSubmit = async () => {
    await stateLaporan.create.create();
    resetForm();
    router.push('/admin/keamanan/laporan-publik');
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
          <Title order={4}>Create Laporan Publik</Title>
          <TextInput
            value={stateLaporan.create.form.judul}
            onChange={(e) => stateLaporan.create.form.judul = e.target.value}
            label={<Text fw={"bold"} fz={"sm"}>Judul Laporan Publik</Text>}
            placeholder='Masukkan judul LaporanPublik'
          />
          <TextInput
            value={stateLaporan.create.form.lokasi}
            onChange={(e) => stateLaporan.create.form.lokasi = e.target.value}
            label={<Text fw={"bold"} fz={"sm"}>Lokasi Laporan Publik</Text>}
            placeholder='Masukkan lokasi LaporanPublik'
          />
          <DateTimePicker
            label="Tanggal Laporan Publik"
            value={
              stateLaporan.create.form.tanggalWaktu
                ? new Date(stateLaporan.create.form.tanggalWaktu)
                : null
            }
            onChange={(val) => {
              if (val) {
                stateLaporan.create.form.tanggalWaktu = val.toString();
              } else {
                stateLaporan.create.form.tanggalWaktu = ""; // Reset kalau dikosongkan
              }
            }}
          />

          <Select
            value={stateLaporan.create.form.status}
            onChange={(e) => stateLaporan.create.form.status = e?.valueOf() as Status}
            label={<Text fw={"bold"} fz={"sm"}>Status Laporan Publik</Text>}
            placeholder='Masukkan status LaporanPublik'
            data={[
              { value: "Selesai", label: "Selesai" },
              { value: "Proses", label: "Proses" },
              { value: "Gagal", label: "Gagal" },
            ]}
          />
          <TextInput
            value={stateLaporan.create.form.kronologi}
            onChange={(e) => stateLaporan.create.form.kronologi = e.target.value}
            label={<Text fw={"bold"} fz={"sm"}>Kronologi Laporan Publik</Text>}
            placeholder='Masukkan kronologi LaporanPublik'
          />
          <Text fw={"bold"} fz={"sm"}>Penanganan Laporan Publik</Text>
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Laporan Publik</Text>
            <CreateEditor
              value={stateLaporan.create.form.penanganan}
              onChange={(e) => stateLaporan.create.form.penanganan = e}
            />
          </Box>
          <Group>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateLaporanPublik;
