import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconImageInPicture } from '@tabler/icons-react';
import React from 'react';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';

function CreateKontakDarurat() {
  return (
    <Box>
      <Stack gap={'xs'}>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Box>
            <Paper bg={colors['white-1']} p={'md'}>
              <Stack gap={"xs"}>
                <Title order={4}>Tambah Kontak Darurat</Title>
                <Box>
                  <Text fw={"bold"} fz={"sm"}>Masukkan Image</Text>
                  <IconImageInPicture size={50} />
                </Box>
                <TextInput
                label={<Text fw={"bold"} fz={"sm"}>Nama Kontak Darurat</Text>}
                placeholder='Masukkan nama kontak darurat'
                />
                <Box>
                  <Text fw={"bold"} fz={"sm"}>Deskripsi Kontak Darurat</Text>
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

          </Box>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default CreateKontakDarurat;
