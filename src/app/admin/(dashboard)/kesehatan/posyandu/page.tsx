import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import React from 'react';
import { KesehatanEditor } from '../_com/kesehatanEditor';

function Posyandu() {
  return (
    <Box>
      <Title order={3}>Kesehatan</Title>
      <SimpleGrid py={10} cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={"md"}>
            <Stack gap={"xs"}>
              <Title order={3}>Posyandu</Title>
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Nama Posyandu</Text>}
                placeholder='masukkan nama posyandu'
              />
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Nomor Telepon Posyandu</Text>}
                placeholder='masukkan nomor telepon posyandu'
              />
              <Box>
              <Text fz={"sm"} fw={"bold"}>Deskripsi Posyandu</Text>
              <KesehatanEditor
                showSubmit={false}
                />
                </Box>
                <Box>
              <Text fz={"sm"} fw={"bold"}>Pelayanan Posyandu</Text>
              <KesehatanEditor
                showSubmit={false}
                />
                </Box>
              <Group>
                <Button bg={colors['blue-button']}>Submit</Button>
              </Group>

            </Stack>
          </Paper>
        </Box>
        <Box>
          <Paper bg={colors['white-1']} p={"md"}>
            <Stack>
              <Title order={3}>Preview Data Posyandu</Title>
            </Stack>
          </Paper>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

export default Posyandu;
