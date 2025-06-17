import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { DesaEditor } from '../../../_com/desaEditor';

function VisiMisiDesa() {
  return (
    <Box py={10}>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <Title order={3}>Visi Desa</Title>
              <Text fw={"bold"}>Deskripsi Visi Desa</Text>
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
              <Title order={3}>List Visi Desa</Title>
            </Stack>
          </Paper>
        </Box>
      </SimpleGrid>
      <SimpleGrid py={30} cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <Title order={3}>Misi Desa</Title>
              <Text fw={"bold"}>Deskripsi Misi Desa</Text>
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
              <Title order={3}>List Misi Desa</Title>
            </Stack>
          </Paper>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

export default VisiMisiDesa;
