import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, TextInput, Title } from '@mantine/core';
import ListPotensi from './listPage';

function Potensi() {
  return (
    <Box py={10}>
      <Stack gap={"xs"}>
        <Title order={3}>Potensi Desa</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Box>
            <Paper bg={colors['white-1']} p={'md'}>
              <Stack>
                <TextInput
                  label="Nama Potensi"
                  placeholder='masukkan nama potensi'
                />
                <TextInput
                  label="Kategori Potensi"
                  placeholder='masukkan kategori potensi'
                />
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
          <ListPotensi />
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default Potensi;
