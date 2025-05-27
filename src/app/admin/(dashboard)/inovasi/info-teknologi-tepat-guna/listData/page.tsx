import colors from '@/con/colors';
import { Box, Paper, SimpleGrid, Stack, Title } from '@mantine/core';
import React from 'react';

function ListDataInfoTeknologiTepatGuna() {
  return (
    <Box>
      <Stack gap={'xs'}>
        <Paper p={'md'} bg={colors['BG-trans']}>
          <Title order={4}>List Data Info Teknologi Tepat Guna</Title>
          <SimpleGrid py={10} cols={{ base: 1, md: 4 }}>
            <Paper p={'md'} bg={colors['white-1']}>
              Data 1
            </Paper>
            <Paper p={'md'} bg={colors['white-1']}>
              Data 2
            </Paper>
            <Paper p={'md'} bg={colors['white-1']}>
              Data 3
            </Paper>
            <Paper p={'md'} bg={colors['white-1']}>
              Data 4
            </Paper>
          </SimpleGrid>
        </Paper>
      </Stack>
    </Box>
  );
}

export default ListDataInfoTeknologiTepatGuna;
