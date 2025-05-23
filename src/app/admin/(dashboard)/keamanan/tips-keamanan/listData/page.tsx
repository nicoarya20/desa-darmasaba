import colors from '@/con/colors';
import { Box, Paper, Stack, Text, Title } from '@mantine/core';
import { IconImageInPicture } from '@tabler/icons-react';
import React from 'react';

function ListDataTipsKeamanan() {
  return (
    <Paper bg={colors['white-1']} p={'md'} radius={10}>
      <Stack gap={"xs"}>
        <Title order={3}>List Data Tips Keamanan</Title>
        <Box>
          <Text fw={"bold"}>Judul Tips Keamanan</Text>
          <Text></Text>
          <Text fw={"bold"}>Gambar Tips Keamanan</Text>
          <IconImageInPicture size={24} color={colors['blue-button']} />
          <Text fw={"bold"}>Deskripsi Tips Keamanan</Text>
          <Text></Text>
        </Box>
      </Stack>
    </Paper>
  );
}

export default ListDataTipsKeamanan;
