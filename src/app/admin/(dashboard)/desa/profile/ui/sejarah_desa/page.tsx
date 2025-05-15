import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { DesaEditor } from '../../../_com/desaEditor';

function SejarahDesa() {
  return (
    <Box py={10}>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <Title order={3}>Sejarah Desa</Title>
              <Text fw={"bold"}>Deskripsi Sejarah Desa</Text>
              <DesaEditor showSubmit={false}/>
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
              <Title order={3}>List Sejarah Desa</Title>
            </Stack>
          </Paper>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

export default SejarahDesa;
