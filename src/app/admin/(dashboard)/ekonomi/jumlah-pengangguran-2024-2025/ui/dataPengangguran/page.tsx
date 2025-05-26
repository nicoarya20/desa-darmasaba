import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';

function DataPengangguran() {
  return (
    <Box>
      <Box py={15}>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Box>
            <Paper bg={colors['white-1']} p={'md'}>
              <Stack gap={"xs"}>
                <Title order={3}>Data Pengangguran</Title>
                <TextInput
                  label={<Text fz={"sm"} fw={"bold"}>Total Pengangguran</Text>}
                  placeholder="masukkan total pengangguran"
                />
                <TextInput
                  label={<Text fz={"sm"} fw={"bold"}>Pengangguran Terdidik</Text>}
                  placeholder="masukkan pengangguran terdidik"
                />
                <TextInput
                  label={<Text fz={"sm"} fw={"bold"}>Usia Produktif</Text>}
                  placeholder="masukkan usia produktif"
                />
                <TextInput
                  label={<Text fz={"sm"} fw={"bold"}>Sedang Mencari Kerja</Text>}
                  placeholder="masukkan jumlah sedang mencari kerja"
                />
                <Group>
                  <Button bg={colors['blue-button']}>
                    Submit
                  </Button>
                </Group>
              </Stack>
            </Paper>
          </Box>
          <Box>
            <Paper bg={colors['white-1']} p={'md'}>
              <Stack gap={"xs"}>
                <Title order={3}>List Data Pengangguran</Title>
                
              </Stack>
            </Paper>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
}

export default DataPengangguran;
