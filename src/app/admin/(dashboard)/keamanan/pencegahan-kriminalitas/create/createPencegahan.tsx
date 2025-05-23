import colors from '@/con/colors';
import { Box, Stack, Text, TextInput } from '@mantine/core';
import { IconImageInPicture } from '@tabler/icons-react';
import React from 'react';

function CreatePencegahan() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <TextInput
          label={<Text fz={"sm"} fw={"bold"}>Judul Pencegahan Kriminalitas</Text>}
          placeholder="masukkan judul pencegahan kriminalitas"
        />
        <TextInput
          label={<Text fz={"sm"} fw={"bold"}>Deskripsi Pencegahan Kriminalitas</Text>}
          placeholder="masukkan deskripsi pencegahan kriminalitas"
        />
        <Text fw={"bold"} fz={"sm"} >Gambar Pencegahan Kriminalitas</Text>
        <IconImageInPicture size={24} color={colors['blue-button']} />
      </Stack>
    </Box>
  );
}

export default CreatePencegahan;
