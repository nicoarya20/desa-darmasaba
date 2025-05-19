import colors from '@/con/colors';
import { Box, Paper, Stack, Title } from '@mantine/core';
import React from 'react';

function ListGambarPenghargaan() {
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <Title order={3}>List Gambar Penghargaan</Title>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ListGambarPenghargaan;
