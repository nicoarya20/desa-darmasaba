import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import React from 'react';

function DataSektorUnggulan() {
  return (
    <Box py={15}>
      <Stack gap={"xs"}>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Box>
            <Paper p={"md"} bg={colors['white-1']}>
              <Stack gap={"xs"}>
                <Title order={3}>Data Sektor Unggulan</Title>
                <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Nama Sektor Unggulan</Text>}
                placeholder="Masukkan nama sektor unggulan"
                />
                <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Deskripsi Sektor Unggulan</Text>}
                placeholder="Masukkan deskripsi sektor unggulan"
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
                <Title order={3}>Data Sektor Unggulan</Title>
              </Stack>
            </Paper>
          </Box>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default DataSektorUnggulan;
