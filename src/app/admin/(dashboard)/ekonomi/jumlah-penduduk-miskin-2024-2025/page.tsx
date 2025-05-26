import { Box, Button, Group, Paper, Stack, TextInput, Title } from '@mantine/core';
import colors from '@/con/colors';
import React from 'react';

function Page() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Box>
          <Paper p={"md"} bg={colors['white-1']} w={{ base: '100%', md: '50%' }}>
            <Stack gap={"xs"}>
              <Title order={3}>Jumlah Penduduk Miskin 2024-2025</Title>
              <TextInput
                label="Tahun"
                placeholder="masukkan tahun"
              />
              <TextInput
                label="Jumlah Penduduk Miskin"
                placeholder="masukkan jumlah penduduk miskin"
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
          <Paper p={"md"} bg={colors['white-1']} >
            <Stack gap={"xs"}>
              <Title order={3}>Grafik Jumlah Penduduk Miskin 2024-2025</Title>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}

export default Page;
