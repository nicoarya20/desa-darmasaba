import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import React from 'react';

function StatistikKemiskinan() {
  return (
    <Box py={15}>
      <Stack gap={"xs"}>
        <Box>
          <Paper w={{base: '100%', md: '50%'}} p={"md"} bg={colors['white-1']}>
            <Stack gap={"xs"}>
              <Title order={3}>Statistik Kemiskinan</Title>
              <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Tahun</Text>}
              placeholder="Masukkan tahun"
              />
              <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Jumlah Penduduk Miskin</Text>}
              placeholder="Masukkan jumlah penduduk miskin"
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
          <Paper p={"md"} bg={colors['white-1']}>
            <Stack gap={"xs"}>
              <Title order={3}>Statistik Kemiskinan</Title>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}

export default StatistikKemiskinan;
