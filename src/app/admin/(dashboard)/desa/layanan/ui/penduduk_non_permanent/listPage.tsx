import colors from '@/con/colors';
import { Box, Paper, Stack, Title } from '@mantine/core';
import React from 'react';

function ListPendudukNonPermanent() {
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <Title order={3}>List Penduduk Non-Permanent</Title>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ListPendudukNonPermanent;
