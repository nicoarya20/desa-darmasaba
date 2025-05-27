import colors from '@/con/colors';
import { Box, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import React from 'react';

function KolaborasiInovasi() {
  return (
    <Box py={15}>
      <Stack gap={"xs"}>
        <Box>
          <Paper w={{ base: "100%", md: "50%" }} bg={colors['white-1']} p={'md'}>
            <Stack gap={"xs"}>
              <Title order={4}>Create Kolaborasi Inovasi</Title>
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Tahun</Text>}
                placeholder="Masukkan tahun"
              />
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Nama Kolaborasi Inovasi</Text>}
                placeholder="Masukkan nama kolaborasi inovasi"
              />
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Deskripsi Kolaborasi Inovasi</Text>}
                placeholder="Masukkan deskripsi kolaborasi inovasi"
              />

            </Stack>
          </Paper>
        </Box>
        <Box>
          <Paper bg={colors['BG-trans']} p={'md'}>
            <Title order={4}>List Data Kolaborasi Inovasi</Title>
            <SimpleGrid py={10} cols={{ base: 1, md: 4 }}>
              <Paper p={'md'} bg={colors['white-1']}>
                Data 1
              </Paper>
              <Paper p={'md'} bg={colors['white-1']}>
                Data 2
              </Paper>
              <Paper p={'md'} bg={colors['white-1']}>
                Data 3
              </Paper>
              <Paper p={'md'} bg={colors['white-1']}>
                Data 4
              </Paper>
            </SimpleGrid>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}

export default KolaborasiInovasi;
