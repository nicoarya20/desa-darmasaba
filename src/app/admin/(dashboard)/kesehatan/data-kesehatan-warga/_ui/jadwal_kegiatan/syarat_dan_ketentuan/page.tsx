import { Box, Text } from '@mantine/core';
import React from 'react';
import TextEditor from '../../../_com/TextEditor';

function SyaratDanKetentuan() {
  return (
    <Box>
      <Text pt={10} fw={"bold"}>Syarat dan Ketentuan</Text>
      <TextEditor/>
    </Box>
  );
}

export default SyaratDanKetentuan;
