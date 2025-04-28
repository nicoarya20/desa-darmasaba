import { Box, Text } from '@mantine/core';
import TextEditor from '../../../_com/TextEditor';

function DeskripsiKegiatan() {
  return (
    <Box>
      <Text pt={10} fw={"bold"}>Deskripsi Kegiatan</Text>
      <TextEditor/>
    </Box>
  );
}

export default DeskripsiKegiatan;
