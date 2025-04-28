import { Box, Text, TextInput } from '@mantine/core';

function InformasiKegiatan() {
  return (
    <Box>
      <Text pt={10} fw={"bold"}>Informasi Kegiatan</Text>
      <TextInput
        label="Nama Kegiatan"
        placeholder="Masukkan nama kegiatan"
      />
      <TextInput
        label="Tanggal"
        placeholder="Masukkan tanggal kegiatan"
      />
      <TextInput
        label="Waktu"
        placeholder="Masukkan waktu kegiatan"
      />
      <TextInput
        label="Lokasi"
        placeholder="Masukkan lokasi kegiatan"
      />
    </Box>
  );
}

export default InformasiKegiatan;
