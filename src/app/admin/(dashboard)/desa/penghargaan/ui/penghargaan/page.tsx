import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import React from 'react';
import { DesaEditor } from '../../../_com/desaEditor';
import ListPenghargaan from './listPage';

function Penghargaan() {
  return (
    <Box py={10}>
      <Stack>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Box>
            <Paper bg={colors['white-1']} p={'md'}>
              <Stack gap={"xs"}>
                <Title order={3}>Penghargaan</Title>
                <Box>
                  <Text fz={"sm"} fw={"bold"}>Deskripsi Penghargaan</Text>
                  <DesaEditor
                    showSubmit={false}
                  />
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
          <ListPenghargaan/>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default Penghargaan;
