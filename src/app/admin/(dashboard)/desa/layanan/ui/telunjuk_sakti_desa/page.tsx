import colors from '@/con/colors';
import { Box, SimpleGrid, Paper, Stack, Title, Group, Button, Text } from '@mantine/core';
import React from 'react';
import { DesaEditor } from '../../../_com/desaEditor';
import ListTelunjukSaktiDesa from './listPage';

function TelunjukSaktiDesa() {
  return (
    <Box py={10}>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <Title order={3}>Telunjuk Sakti Desa</Title>
              <Box>
                <Text fz={"sm"} fw={"bold"}>Deskripsi Telunjuk Sakti Desa</Text>
                <DesaEditor showSubmit={false} />
              </Box>
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
        <ListTelunjukSaktiDesa />
      </SimpleGrid>
    </Box>
  );
}

export default TelunjukSaktiDesa;
