import { Box, Stack, Text, TextInput, Title } from '@mantine/core';

function CreateLowongan() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Title order={4}>Lowongan Kerja Lokal</Title>
        <TextInput
          label={<Text fz={"sm"} fw={"bold"}>Bekerja Sebagai</Text>}
          placeholder="masukkan bekerja sebagai"
        />
        <TextInput
          label={<Text fz={"sm"} fw={"bold"}>Alamat Usaha</Text>}
          placeholder="masukkan alamat usaha"
        />
         <TextInput
          label={<Text fz={"sm"} fw={"bold"}>Waktu Kerja</Text>}
          placeholder="masukkan waktu kerja"
        />
        <TextInput
          label={<Text fz={"sm"} fw={"bold"}>Gaji selama 1 bulan</Text>}
          placeholder="masukkan gaji selama 1 bulan"
        />
      </Stack>
    </Box>
  );
}

export default CreateLowongan;
