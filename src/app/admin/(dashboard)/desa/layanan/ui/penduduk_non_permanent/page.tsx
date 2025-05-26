import colors from '@/con/colors';
import { Box, SimpleGrid, Paper, Stack, Title, Group, Button, Text } from '@mantine/core';
import React from 'react';
import { DesaEditor } from '../../../_com/desaEditor';
import ListPendudukNonPermanent from './listPage';

function PendudukNonPermanent() {
  return (
    <Box py={10}>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <Title order={3}>Penduduk Non-Permanent</Title>
              <Text fw={"bold"}>Deskripsi Penduduk Non-Permanent</Text>
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
        <ListPendudukNonPermanent />
      </SimpleGrid>
    </Box>
  );
}

export default PendudukNonPermanent;

