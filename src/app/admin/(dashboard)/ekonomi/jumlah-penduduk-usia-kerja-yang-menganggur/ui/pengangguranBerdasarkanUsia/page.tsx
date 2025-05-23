import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import React from 'react';

function PengangguranBerdasarkanUsia() {
  return (
    <Box>
      <Box py={15}>
      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'} radius={10}>
        <Stack gap={"xs"}>
          <Title order={3}>Pengangguran Berdasarkan Usia</Title>
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Usia 18 - 25 tahun</Text>}
            placeholder="masukkan jumlah penduduk usia 18 - 25 tahun yang menganggur"
          />
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Usia 26 - 35 tahun</Text>}
            placeholder="masukkan jumlah penduduk usia 26 - 35 tahun yang menganggur"
          />
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Usia 36 - 45 tahun</Text>}
            placeholder="masukkan jumlah penduduk usia 36 - 45 tahun yang menganggur"
          />
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Usia 46+</Text>}
            placeholder="masukkan jumlah penduduk usia 46+ yang menganggur"
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
            <Title pb={10} order={3}>Grafik Pengangguran Berdasarkan Usia</Title>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default PengangguranBerdasarkanUsia;
