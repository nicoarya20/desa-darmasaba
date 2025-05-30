import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconImageInPicture } from '@tabler/icons-react';
import React from 'react';

function Page() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Box>
          <Paper w={{ base: '100%', md: '50%' }} p={"md"} bg={colors['white-1']}>
            <Stack gap={"xs"}>
              <Title order={3}>Create Data Desa Digital Smart Village</Title>
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Nama Desa Digital Smart Village</Text>}
                placeholder="Masukkan nama desa digital smart village"
              />
              <TextInput
                label={<Text fz={"sm"} fw={"bold"}>Deskripsi Desa Digital Smart Village</Text>}
                placeholder="Masukkan deskripsi desa digital smart village"
              />
              <Box>
                <Text fz={"sm"} fw={"bold"}>
                  Upload Gambar Desa Digital Smart Village
                </Text>
                <IconImageInPicture size={24} />
              </Box>
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
              <Title order={3}>Create Data Desa Digital Smart Village</Title>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}

export default Page;
