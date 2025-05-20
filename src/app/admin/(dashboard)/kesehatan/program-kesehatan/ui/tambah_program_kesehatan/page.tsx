import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import React from 'react';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';
import { IconImageInPicture } from '@tabler/icons-react';

function CreateProgramKesehatan() {
  return (
    <Box>
      <Stack gap={'xs'}>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Box>
            <Paper bg={colors['white-1']} p={'md'}>
              <Stack gap={'xs'}>
                <Title order={4}>Tambah Program Kesehatan</Title>
                <Box>
                  <Text fw={"bold"} fz={"sm"}>Deskripsi Program Kesehatan</Text>
                  <KesehatanEditor
                    showSubmit={false}
                  />
                </Box>
                <Box>
                  <Text>Masukkan Image</Text>
                  <IconImageInPicture size={50} />
                </Box>
                <TextInput
                  label={<Text fw={"bold"} fz={"sm"}>Nama Konten Program Kesehatan</Text>}
                  placeholder='Masukkan nama konten program kesehatan'
                />
                <Box>
                  <Text fw={"bold"} fz={"sm"}>Deskripsi Konten Program Kesehatan</Text>
                  <KesehatanEditor
                    showSubmit={false}
                  />
                </Box>
                <Group>
                  <Button bg={colors['blue-button']}>Submit</Button>
                </Group>
              </Stack>
            </Paper>
          </Box>
          <Box>
            <Paper bg={colors['white-1']} p={"md"}>
              <Stack gap={"xs"}>
                <Title order={4}>Preview Data Program Kesehatan</Title>
                <Text fw={"bold"} fz={"sm"}>Deskripsi Program Kesehatan</Text>
                <Box>
                  <Text fw={"bold"} fz={"sm"}>Image</Text>
                  <IconImageInPicture size={50} />
                </Box>
                <Text fw={"bold"} fz={"sm"}>Nama Konten Program Kesehatan</Text>
                <Text fw={"bold"} fz={"sm"}>Deskripsi Konten Program Kesehatan</Text>
              </Stack>
            </Paper>
          </Box>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default CreateProgramKesehatan;
