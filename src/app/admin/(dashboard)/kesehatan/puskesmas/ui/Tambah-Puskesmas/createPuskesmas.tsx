import colors from '@/con/colors';
import { Box, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import React from 'react';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';

function CreatePuskesmas() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Box>
            <Paper bg={colors['white-1']} p={"md"}>
              <Stack gap={"xs"}>
                <Title order={4}>Tambah Puskesmas</Title>
                <TextInput
                  label={<Text fw={"bold"} fz={"sm"}>Nama Puskesmas</Text>}
                  placeholder='Masukkan nama puskesmas'
                />
                <TextInput
                  label={<Text fw={"bold"} fz={"sm"}>No Telp Puskesmas</Text>}
                  placeholder='Masukkan no telp puskesmas'
                />
                <Box>
                  <Text fw={"bold"} fz={"sm"}>Deskripsi</Text>
                  <KesehatanEditor
                    showSubmit={false}
                  />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"sm"}>Pelayanan Posyandu</Text>
                  <KesehatanEditor
                    showSubmit={false}
                  />
                </Box>
              </Stack>
            </Paper>
          </Box>
          <Box>
            <Paper bg={colors['white-1']} p={"md"}>
              <Stack gap={"xs"}>
                <Title order={4}>Preview Data Puskesmas</Title>
                <Text fw={"bold"} fz={"sm"}>Nama Puskesmas</Text>
                <Text fw={"bold"} fz={"sm"}>No Telp Puskesmas</Text>
                <Text fw={"bold"} fz={"sm"}>Deskripsi</Text>
                <Text fw={"bold"} fz={"sm"}>Pelayanan Posyandu</Text>
              </Stack>
            </Paper>
          </Box>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default CreatePuskesmas;
