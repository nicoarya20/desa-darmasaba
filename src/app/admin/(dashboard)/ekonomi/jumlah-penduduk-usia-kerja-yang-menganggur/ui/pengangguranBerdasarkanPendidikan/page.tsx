import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import React from 'react';

function PengangguranBerdasarkanPendidikan() {
  return (
    <Box>
      <Box py={15}>
      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'} radius={10}>
        <Stack gap={"xs"}>
          <Title order={3}>Pengangguran Berdasarkan Pendidikan</Title>
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Pendidikan SD</Text>}
            placeholder="masukkan jumlah penduduk Pendidikan SD yang menganggur"
          />
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Pendidikan SMP</Text>}
            placeholder="masukkan jumlah penduduk Pendidikan SMP yang menganggur"
          />
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Pendidikan SMA / SMK</Text>}
            placeholder="masukkan jumlah penduduk Pendidikan SMA / SMK yang menganggur"
          />
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Pendidikan D1-D3 / S1</Text>}
            placeholder="masukkan jumlah penduduk Pendidikan D1-D3 yang menganggur"
          />
          <Group>
            <Button mt={10} bg={colors['blue-button']}>
              Submit
            </Button>
          </Group>
        </Stack>
      </Paper>
      </Box>
      <Box>
        <Paper bg={colors['white-1']} w={{ base: '100%', md: '50%' }} p={'md'}>
          <Stack>
            <Title pb={10} order={3}>Grafik Pengangguran Berdasarkan Pendidikan</Title>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default PengangguranBerdasarkanPendidikan;
