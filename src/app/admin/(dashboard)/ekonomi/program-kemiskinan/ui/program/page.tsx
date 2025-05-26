import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import React from 'react';

function ProgramKemiskinan() {
  return (
    <Box py={15}>
      <SimpleGrid cols={{base: 1, md: 2}}>
        <Box>
        <Paper p={"md"} bg={colors['white-1']}>
        <Stack gap={"xs"}>
          <Title order={3}>Program Kemiskinan</Title>
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Nama Program</Text>}
            placeholder="Masukkan nama program"
          />
          <TextInput
            label={<Text fz={"sm"} fw={"bold"}>Deskripsi Program</Text>}
            placeholder="Masukkan deskripsi program"
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
              <Title order={3}>List Data Program Kemiskinan</Title>
            </Stack>
          </Paper>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

export default ProgramKemiskinan;
