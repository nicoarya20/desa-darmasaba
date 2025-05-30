import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import React from 'react';

function Page() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Box>
          <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={"md"}>
            <Stack gap={"xs"}>
              <Title order={3}>Demografi Pekerjaan</Title>
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Jumlah Pekerja Laki - Laki</Text>}
                placeholder="Masukkan jumlah pekerja laki - laki"
              />
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Jumlah Pekerja Perempuan</Text>}
                placeholder="Masukkan jumlah pekerja perempuan"
              />
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Nama Pekerjaan</Text>}
                placeholder="Masukkan nama pekerjaan"
              />
              <Group>
                <Button
                  bg={colors['blue-button']}
                >
                  Submit
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Box>
        <Box>
          <Paper bg={colors['white-1']} p={"md"}>
            <Stack gap={"xs"}>
              <Title order={3}>Grafik Demografi Pekerjaan</Title>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}

export default Page;
