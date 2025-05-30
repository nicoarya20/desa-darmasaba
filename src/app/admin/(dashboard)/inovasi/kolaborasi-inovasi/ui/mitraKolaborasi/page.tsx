import React from 'react';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import colors from '@/con/colors';
import { IconImageInPicture } from '@tabler/icons-react';

function MitraKolaborasi() {
  return (
    <Box py={15}>
      <Stack gap={'xs'}>
        <Box>
        <Paper w={{ base: "100%", md: "50%" }} bg={colors['white-1']} p={'md'}>
          <Stack gap={'xs'}>
            <Title order={4}>Create Mitra Kolaborasi</Title>
            <TextInput
              label={<Text fz={"sm"} fw={"bold"}>Nama Mitra Kolaborasi</Text>}
              placeholder="Masukkan nama mitra kolaborasi"
            />
            <Box>
              <Text fw={"bold"} fz={"sm"}>Masukkan Image</Text>
              <IconImageInPicture size={50}/>
            </Box>
            <Group>
              <Button bg={colors['blue-button']}>Submit</Button>
            </Group>
          </Stack>
        </Paper>
        </Box>
        <Box>
          <Paper bg={colors['BG-trans']} p={'md'}>
            <Title order={4}>List Data Kolaborasi Inovasi</Title>
            <SimpleGrid py={10} cols={{ base: 1, md: 4 }}>
              <Paper p={'md'} bg={colors['white-1']}>
                Foto 1
              </Paper>
              <Paper p={'md'} bg={colors['white-1']}>
                Foto 2
              </Paper>
              <Paper p={'md'} bg={colors['white-1']}>
                Foto 3
              </Paper>
              <Paper p={'md'} bg={colors['white-1']}>
                Foto 4
              </Paper>
            </SimpleGrid>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}

export default MitraKolaborasi;
