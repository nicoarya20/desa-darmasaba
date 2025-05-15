import colors from '@/con/colors';
import { Box, SimpleGrid, Paper, Stack, Title, Group, Button, TextInput, Text } from '@mantine/core';
import React from 'react';
import { DesaEditor } from '../../../_com/desaEditor';

function ProfilePerbekel() {
  return (
    <Box py={10}>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <Title order={3}>Profil Perbekel</Title>
              <TextInput
              label="Nama Perbekel"
              placeholder="masukkan nama perbekel"
              />
              <Text fz={"sm"} fw={"bold"}>Biodata</Text>
              <DesaEditor showSubmit={false} />
              <Text fz={"sm"} fw={"bold"}>Pengalaman</Text>
              <DesaEditor showSubmit={false} />
              <Text fz={"sm"} fw={"bold"}>Pengalaman Organisasi</Text>
              <DesaEditor showSubmit={false} />
              <Text fz={"sm"} fw={"bold"}>Program Unggulan</Text>
              <DesaEditor showSubmit={false} />
              <Group>
                <Button
                  mt={10}
                  bg={colors['blue-button']}
                >
                  Submit
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Box>
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <Title order={3}>List Profil Perbekel</Title>
            </Stack>
          </Paper>
        </Box>
      </SimpleGrid>
      </Box>
  );
}

export default ProfilePerbekel;
