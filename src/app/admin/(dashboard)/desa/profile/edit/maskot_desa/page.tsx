import colors from '@/con/colors';
import { Box, SimpleGrid, Paper, Stack, Title, Group, Button, Text } from '@mantine/core';
import React from 'react';
import { DesaEditor } from '../../../_com/desaEditor';

function MaskotDesa() {
  return (
    <Box py={10}>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <Title order={3}>Maskot Desa</Title>
              <Text fw={"bold"}>Deskripsi Maskot Desa</Text>
              <DesaEditor showSubmit={false} />
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
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <Title order={3}>List Maskot Desa</Title>
            </Stack>
          </Paper>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

export default MaskotDesa;
