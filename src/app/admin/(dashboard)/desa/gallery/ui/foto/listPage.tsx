import colors from '@/con/colors';
import { Box, Paper, Stack, Title } from '@mantine/core';
import React from 'react';

function ListFoto() {
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={3}>List Foto</Title>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ListFoto;
