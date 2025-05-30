import colors from '@/con/colors';
import { Box, Stack, Text, TextInput } from '@mantine/core';
import { IconImageInPicture } from '@tabler/icons-react';

function CreateKontakDarurat() {
  return (
    <Box>
     <Stack gap={"xs"}>
      <TextInput 
      label={<Text fz={"sm"} fw={"bold"}>Judul Kontak Darurat</Text>}
      placeholder="masukkan judul kontak darurat"
      />
      <IconImageInPicture size={24} color={colors['blue-button']} />
      <TextInput 
      label={<Text fz={"sm"} fw={"bold"}>Nama Kontak Darurat</Text>}
      placeholder="masukkan nama kontak darurat"
      />
      <IconImageInPicture size={24} color={colors['blue-button']} />
      <TextInput 
      label={<Text fz={"sm"} fw={"bold"}>Nomor Kontak Darurat</Text>}
      placeholder="masukkan nomor kontak darurat"
      />
     </Stack>
    </Box>
  );
}

export default CreateKontakDarurat;
