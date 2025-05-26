import colors from '@/con/colors';
import { Box, Paper, SimpleGrid, Stack, Title, Text, Group, Button, TextInput, Center } from '@mantine/core';
import React from 'react';
import { DesaEditor } from '../../../_com/desaEditor';
import ListGambarPenghargaan from './listPage';
import { IconUpload } from '@tabler/icons-react';


function GambarPerhargaan() {
  return (
    <Box py={10}>
      <Stack gap={"xs"}>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Box>
            <Paper bg={colors['white-1']} p={'md'}>
              <Stack gap={"xs"}>
                <Title order={3}>Tambah Gambar Penghargaan</Title>
                <TextInput
                  label="Judul Gambar Penghargaan"
                  placeholder='masukkan judul gambar penghargaan'
                />
                <Text fw={"bold"}>Deskripsi Gambar Penghargaan</Text>
                <DesaEditor showSubmit={false} />
                <Box>
                  <Text fw={"bold"}>Upload Gambar Penghargaan</Text>
                  <Box bg={colors['BG-trans']} p={"md"}>
                    <Center>
                      <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                    </Center>
                  </Box>
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
          <ListGambarPenghargaan />
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default GambarPerhargaan;
