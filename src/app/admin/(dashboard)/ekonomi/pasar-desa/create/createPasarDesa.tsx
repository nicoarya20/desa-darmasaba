import colors from '@/con/colors';
import { Box, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconImageInPicture } from '@tabler/icons-react';
import React from 'react';

function CreatePasarDesa() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Title order={4}>Produk Pasar Desa</Title>
        <Box>
          <Text fz={"sm"} fw={"bold"}>Masukkan Foto Produk</Text>
          <IconImageInPicture size={24} color={colors['blue-button']} />
        </Box>
        <TextInput
          label={<Text fz={"sm"} fw={"bold"}>Nama Produk</Text>}
          placeholder="masukkan nama produk"
        />
        <TextInput
          label={<Text fz={"sm"} fw={"bold"}>Harga Produk</Text>}
          placeholder="masukkan harga produk"
        />
         <TextInput
          label={<Text fz={"sm"} fw={"bold"}>Rating Produk</Text>}
          placeholder="masukkan rating produk"
        />
         <TextInput
          label={<Text fz={"sm"} fw={"bold"}>Alamat Usaha</Text>}
          placeholder="masukkan alamat usaha"
        />
      </Stack>
    </Box>
  );
}

export default CreatePasarDesa;
