'use client'
import colors from '@/con/colors';
import { Box, Stack, SimpleGrid, Paper, Title, TextInput, Text, Button } from '@mantine/core';
import { KesehatanEditor } from '../../_com/kesehatanEditor';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';


function EditProgramKesehatan() {
  const router = useRouter();
  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Stack gap={"xs"}>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Box>
            <Paper bg={colors['white-1']} p={"md"}>
              <Stack gap={"xs"}>
                <Title order={3}>Edit Program Kesehatan</Title>
                <TextInput
                  label={<Text fw={"bold"} fz={"sm"}>Nama Program Kesehatan</Text>}
                  placeholder='Masukkan nama Program Kesehatan'
                />
                <TextInput
                  label={<Text fw={"bold"} fz={"sm"}>No Telp Program Kesehatan</Text>}
                  placeholder='Masukkan no telp Program Kesehatan'
                />
                <Box>
                  <Text fw={"bold"} fz={"sm"}>Deskripsi</Text>
                  <KesehatanEditor
                    showSubmit={false}
                  />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"sm"}>Pelayanan Posyandu</Text>
                  <KesehatanEditor
                    showSubmit={false}
                  />
                </Box>
              </Stack>
            </Paper>
          </Box>
          <Box>
            <Paper bg={colors['white-1']} p={"md"}>
              <Stack gap={"xs"}>
                <Title order={4}>Preview Data Program Kesehatan</Title>
                <Text fw={"bold"} fz={"sm"}>Nama Program Kesehatan</Text>
                <Text fw={"bold"} fz={"sm"}>No Telp Program Kesehatan</Text>
                <Text fw={"bold"} fz={"sm"}>Deskripsi</Text>
                <Text fw={"bold"} fz={"sm"}>Pelayanan Posyandu</Text>
              </Stack>
            </Paper>
          </Box>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default EditProgramKesehatan;
