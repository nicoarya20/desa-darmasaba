import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconImageInPicture } from '@tabler/icons-react';
import React from 'react';
import { KeamananEditor } from '../../../_com/keamananEditor';


function KeamananLingkungan() {
  return (
    <Box>
      <Stack gap={'xs'}>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Box>
            <Paper bg={colors['white-1']} p={'md'}>
              <Stack gap={"xs"}>
                <Title order={4}>Tambah Keamanan Lingkungan</Title>
                <Box>
                  <Text fw={"bold"} fz={"sm"}>Masukkan Image</Text>
                  <IconImageInPicture size={50} />
                </Box>
                <TextInput
                  label={<Text fw={"bold"} fz={"sm"}>Nama Keamanan Lingkungan</Text>}
                  placeholder='Masukkan nama keamanan lingkungan'
                />
                <Box>
                  <Text fw={"bold"} fz={"sm"}>Deskripsi Keamanan Lingkungan</Text>
                  <KeamananEditor
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

export default KeamananLingkungan;
