import colors from '@/con/colors';
import { Box, Paper, Stack, Text, Title } from '@mantine/core';
import React from 'react';

function ListDataKontakDarurat() {
  return (
    <Paper bg={colors['white-1']} p={'md'} radius={10}>
      <Stack gap={"xs"}>
        <Title order={3}>List Data Kontak Darurat</Title>
        <Box>
          <Text fw={"bold"}>Judul Kontak Darurat</Text>
          <Text> </Text>
          <Text fw={"bold"}>Nama Kontak Darurat</Text>
          <Text> </Text>
          <Text fw={"bold"}>Nomor Kontak Darurat</Text>
          <Text> </Text>
        </Box>
      </Stack>
    </Paper>
  );
}

export default ListDataKontakDarurat;
