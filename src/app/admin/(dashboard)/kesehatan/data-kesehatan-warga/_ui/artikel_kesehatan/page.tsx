import { Box, SimpleGrid, Stack, TextInput, Title } from '@mantine/core';
import React from 'react';

function ArtikelKesehatan() {
  return (
    <Stack>
      <SimpleGrid cols={{
        base: 1, md: 2
      }}>
        <Box>
          <Title order={3}>Artikel Kesehatan</Title>
          <TextInput
            label="Jadwal"
            placeholder='masukkan artikel kesehatan'
          />
        </Box>
        <Box>
          <Title order={3}>List Artikel Kesehatan</Title>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}


export default ArtikelKesehatan;
