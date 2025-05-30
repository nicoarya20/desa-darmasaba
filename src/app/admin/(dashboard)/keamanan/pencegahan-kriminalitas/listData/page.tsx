import colors from '@/con/colors';
import { Box, Paper, Stack, Text, Title } from '@mantine/core';
import React from 'react';

function ListDataPencegahan() {
  return (
    <Paper bg={colors['white-1']} p={'md'} radius={10}>
      <Stack gap={"xs"}>
        <Title order={3}>List Data Pencegahan Kriminalitas</Title>
        <Box>
          <Text fw={"bold"}>Judul Pencegahan Kriminalitas</Text>
          <Text> </Text>
          <Text fw={"bold"}>Deskripsi Pencegahan Kriminalitas</Text>
          <Text> </Text>
          <Text fw={"bold"}>Gambar Pencegahan Kriminalitas</Text>
          <Text> </Text>
        </Box>
      </Stack>
    </Paper>
  );
}

export default ListDataPencegahan;
