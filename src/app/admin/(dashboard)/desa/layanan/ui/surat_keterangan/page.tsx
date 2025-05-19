import colors from '@/con/colors';
import { Box, SimpleGrid, Paper, Stack, Title, Button, Group, TextInput, Text, Center, Flex } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import React from 'react';
import ListSuratKeterangan from './listPage';

function SuratKeterangan() {
  return (
    <Box py={10}>
      <Stack gap={"xs"}>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Box>
            <Paper bg={colors['white-1']} p={'md'}>
              <Stack gap={"xs"}>
                <Title order={3}>Pelayanan Surat Keterangan</Title>
                <TextInput
                  label={<Text fz={"sm"} fw={"bold"}>Nama Surat Keterangan</Text>}
                  placeholder='masukkan nama surat keterangan'
                />
                <Text fz={"sm"} fw={"bold"}>Upload Gambar Surat Keterangan</Text>
                <Box bg={colors['BG-trans']} p={"md"}>
                  <Center>
                    <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                  </Center>
                </Box>
                <Flex>
                  <Text fz={"xs"} c={"red"}>*</Text>
                  <Text fz={"xs"} c={"dimmed"} fw={"bold"}>Upload foto untuk konten surat keterangan</Text>
                </Flex>
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
          <ListSuratKeterangan />
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default SuratKeterangan;
