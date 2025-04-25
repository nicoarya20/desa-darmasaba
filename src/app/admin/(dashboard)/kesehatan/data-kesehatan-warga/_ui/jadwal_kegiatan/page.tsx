import { Box, SimpleGrid, Stack, TextInput, Title } from '@mantine/core';
import React from 'react';

function JadwalKegiatan() {
  return (
    <Stack>
      <SimpleGrid cols={{
        base: 1, md: 2
      }}>
        <Box>
          <Title order={3}>Jadwal Kegiatan</Title>
          <TextInput
            label="Jadwal"
            placeholder='masukkan jadwal kegiatan'
          />
        </Box>
        <Box>
          <Title order={3}>List Jadwal Kegiatan</Title>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}


export default JadwalKegiatan;
