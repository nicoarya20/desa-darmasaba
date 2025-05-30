import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import React from 'react';

function GrafikDataSektor() {
  return (
    <Box py={15}>
      <Stack gap={"xs"}>
        <Box>
        <Paper w={{base: '100%', md: '50%'}} p={"md"} bg={colors['white-1']}>
          <Stack gap={"xs"}>
            <Title order={3}>Grafik Data Sektor Unggulan</Title>
            <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Nama Sektor Unggulan</Text>}
            placeholder="Masukkan nama sektor unggulan"
            />
            <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Jumlah Sektor Unggulan</Text>}
            placeholder="Masukkan jumlah sektor unggulan"
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
            <Title order={3}>Grafik Sektor Unggulan</Title>
            
          </Stack>
        </Paper>
        </Box>
      </Stack>
    </Box>
  );
}

export default GrafikDataSektor;
