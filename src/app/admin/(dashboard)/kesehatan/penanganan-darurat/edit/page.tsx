'use client'
import colors from '@/con/colors';
import { Box, Stack, SimpleGrid, Paper, Title, TextInput, Text, Button, Image } from '@mantine/core';
import { KesehatanEditor } from '../../_com/kesehatanEditor';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';


function EditPenangananDarurat() {
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
                <Title order={3}>Edit Penanganan Darurat</Title>
                <TextInput
                  label={<Text fw={"bold"} fz={"sm"}>Nama Penanganan Darurat</Text>}
                  placeholder='Masukkan nama Penanganan Darurat'
                />
                <TextInput
                  label={<Text fw={"bold"} fz={"sm"}>Deskripsi Penanganan Darurat</Text>}
                  placeholder='Masukkan deskripsi Penanganan Darurat'
                />
                <Box>
                  <Text fw={"bold"} fz={"sm"}>Deskripsi</Text>
                  <KesehatanEditor
                    showSubmit={false}
                  />
                </Box>
                <Box>
                  <Text fw={"bold"} fz={"sm"}>Gambar</Text>
                  <Image src={"/"} alt="gambar" />
                </Box>
              </Stack>
            </Paper>
          </Box>
          <Box>
            <Paper bg={colors['white-1']} p={"md"}>
              <Stack gap={"xs"}>
                <Title order={4}>Preview Data Penanganan Darurat</Title>
                <Text fw={"bold"} fz={"sm"}>Nama Penanganan Darurat</Text>
                <Text fw={"bold"} fz={"sm"}>No Telp Penanganan Darurat</Text>
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

export default EditPenangananDarurat;
