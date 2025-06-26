'use client'
import stateJadwalKegiatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import colors from '@/con/colors';
import { Box, Paper, Stack, TextInput, Title } from '@mantine/core';
import { useProxy } from 'valtio/utils';

function InformasiKegiatan() {
  const informasiKegiatanState = useProxy(stateJadwalKegiatan.informasiKegiatan)
  return (
    <Box>
     <Paper bg={colors['white-1']} p={'md'}>
     <Stack gap={"xs"}>
      <Title order={4}>Informasi Kegiatan</Title>
      <TextInput
        label="Nama Kegiatan"
        placeholder="Masukkan nama kegiatan"
        onChange={(val) => {
          informasiKegiatanState.create.form.name = val.target.value
        }}
      />
      <TextInput
        label="Tanggal"
        placeholder="Masukkan tanggal kegiatan"
        onChange={(val) => {
          informasiKegiatanState.create.form.tanggal = val.target.value
        }}
      />
      <TextInput
        label="Waktu"
        placeholder="Masukkan waktu kegiatan"
        onChange={(val) => {
          informasiKegiatanState.create.form.waktu = val.target.value
        }}
      />
      <TextInput
        label="Lokasi"
        placeholder="Masukkan lokasi kegiatan"
        onChange={(val) => {
          informasiKegiatanState.create.form.lokasi = val.target.value
        }}
      />
     </Stack>
     </Paper>
    </Box>
  );
}

export default InformasiKegiatan;
