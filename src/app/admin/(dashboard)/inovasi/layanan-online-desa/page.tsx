import colors from '@/con/colors';
import { Box, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconImageInPicture } from '@tabler/icons-react';
import React from 'react';

function Page() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Box>
          <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
            <Stack gap={'xs'}>
              <Title order={3}>Layanan Online Desa</Title>
              <TextInput
                label={<Text fz={'sm'} fw={'bold'}>Nama Layanan</Text>}
                placeholder="Masukkan nama layanan"
              />
              <TextInput
                label={<Text fz={'sm'} fw={'bold'}>Deskripsi Layanan</Text>}
                placeholder="Masukkan deskripsi layanan"
              />
              <Box>
                <Text fz={'sm'} fw={'bold'}>Upload Gambar Layanan</Text>
                <IconImageInPicture size={24} />
              </Box>
            </Stack>
          </Paper>
        </Box>
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack gap={'xs'}>
              <Title order={3}>List Data Layanan Online Desa</Title>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}

export default Page;
