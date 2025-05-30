import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Title } from '@mantine/core';
import React from 'react';
import CreatePasarDesa from './create/createPasarDesa';
import ListDataUsaha from './listData/page';

function Page() {
  return (
    <Stack gap={'xs'}>
      <Box>
        <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'} radius={10}>
          <Stack gap={'xs'}>
            <Title order={3}>Pasar Desa</Title>
            <CreatePasarDesa />
            <Group>
              <Button
                mt={10}
                bg={colors['blue-button']}
              >
                Submit
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Box>
      <ListDataUsaha />
    </Stack>
  );
}

export default Page;
