import colors from '@/con/colors';
import { Box, Button, Center, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { DesaEditor } from '../../../_com/desaEditor';
import ListFoto from './listPage';

function Foto() {
  return (
    <Box py={10}>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack gap={"xs"}>
              <Title order={3}>Foto</Title>
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Tanggal Foto</Text>}
                placeholder="2022-01-01"
              />
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Judul Foto</Text>}
                placeholder="Judul Foto"
              />
              <Text fz={"sm"} fw={"bold"}>Upload Foto</Text>
              <Box bg={colors['BG-trans']} p={"md"}>
                <Center>
                  <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Center>
              </Box>
              <Box>
                <Text fz={"sm"} fw={"bold"}>Deskripsi Foto</Text>
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
        <ListFoto/>
      </SimpleGrid>
    </Box>
  );
}

export default Foto;
