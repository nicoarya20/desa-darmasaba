import React from 'react';
import { Box, Paper, Stack, Text, Title } from '@mantine/core';
import colors from '@/con/colors';

function ListDataLaporanPublik() {
  return (
    <Paper bg={colors['white-1']} p={'md'} radius={10}>
      <Stack gap={"xs"}>
        <Title order={3}>List Data Laporan Publik</Title>
        <Box>
          <Text fw={"bold"}>Judul Laporan Publik</Text>
          <Text></Text>
          <Text fw={"bold"}>Tanggal Laporan Publik</Text>
          <Text></Text>
          <Text fw={"bold"}>Deskripsi Laporan Publik</Text>
          <Text></Text>
        </Box>
      </Stack>
    </Paper>
  );
}

export default ListDataLaporanPublik;
