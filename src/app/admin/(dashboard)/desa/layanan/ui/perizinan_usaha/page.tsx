import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import React from 'react';
import ListPerizinanUsaha from './listPage';
import { DesaEditor } from '../../../_com/desaEditor';

function PerizinanUsaha() {
  return (
    <Box py={10}>
      <Stack gap={"xs"}>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Box>
            <Paper bg={colors['white-1']} p={'md'}>
              <Stack gap={"xs"}>
                <Title order={3}>Pelayanan Perizinan Usaha</Title>
                <Box>
                  <Text fz={"sm"} fw={"bold"}>Deskripsi Perizinan Usaha</Text>
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
         <ListPerizinanUsaha />
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default PerizinanUsaha;
