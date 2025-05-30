import colors from '@/con/colors';
import { Box, Paper, Stack, Title, Text } from '@mantine/core';
import React from 'react';

function ListDataLowongan() {
  return (
    <Paper bg={colors['white-1']} p={'md'} radius={10}>
      <Stack gap={"xs"}>
        <Title order={3}>List Data Lowongan Kerja Lokal</Title>
        <Box>
          <Text fw={"bold"}>Bekerja Sebagai</Text>
          <Text> </Text>
          <Text fw={"bold"}>Alamat Usaha</Text>
          <Text> </Text>
          <Text fw={"bold"}>Waktu Kerja</Text>
          <Text> </Text>
          <Text fw={"bold"}>Gaji selama 1 bulan</Text>
          <Text> </Text>
        </Box>
      </Stack>
    </Paper>
  );
}

export default ListDataLowongan;
