import colors from '@/con/colors';
import { Box, Button, Center, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { DesaEditor } from '../../../_com/desaEditor';
import ListVideo from './listPage';

function Video() {
  return (
    <Box py={10}>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack gap={"xs"}>
              <Title order={3}>Video</Title>
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Tanggal Video</Text>}
                placeholder="2022-01-01"
              />
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Judul Video</Text>}
                placeholder="Judul Video"
              />
              <Text fz={"sm"} fw={"bold"}>Upload Video</Text>
              <Box bg={colors['BG-trans']} p={"md"}>
                <Center>
                  <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Center>
              </Box>
              <Box>
                <Text fz={"sm"} fw={"bold"}>Deskripsi Video</Text>
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
        <ListVideo/>
      </SimpleGrid>
    </Box>
  );
}

export default Video;
