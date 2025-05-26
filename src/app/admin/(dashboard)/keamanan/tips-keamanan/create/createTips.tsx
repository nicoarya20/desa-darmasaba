import colors from '@/con/colors';
import { Box, Stack, Text, TextInput } from '@mantine/core';
import { IconImageInPicture } from '@tabler/icons-react';
import React from 'react';
import { KeamananEditor } from '../../_com/keamananEditor';

function CreateTipsKeamanan() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <TextInput
          label={<Text fz={"sm"} fw={"bold"}>Judul Tips Keamanan</Text>}
          placeholder="masukkan judul tips keamanan"
        />
        <Box>
          <Text fz={"sm"} fw={"bold"}>Upload Gambar</Text>
          <IconImageInPicture size={24} color={colors['blue-button']} />
        </Box>
        <KeamananEditor
          showSubmit={false}
        />
      </Stack>
    </Box>
  );
}

export default CreateTipsKeamanan;
