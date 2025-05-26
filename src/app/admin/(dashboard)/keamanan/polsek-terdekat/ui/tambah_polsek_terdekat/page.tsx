import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { KeamananEditor } from '../../../_com/keamananEditor';


function CreatePolsekTerdekat() {
  return (
    <Box>
      <Stack gap={'xs'}>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Box>
            <Paper bg={colors['white-1']} p={'md'}>
              <Stack gap={"xs"}>
                <Title order={4}>Tambah Polsek Terdekat</Title>
                <TextInput
                label={<Text fw={"bold"} fz={"sm"}>Nama Polsek Terdekat</Text>}
                placeholder='Masukkan nama polsek terdekat'
                />
                <TextInput
                label={<Text fw={"bold"} fz={"sm"}>Jarak Polsek Terdekat</Text>}
                placeholder='Masukkan jarak polsek terdekat'
                />
                <TextInput
                label={<Text fw={"bold"} fz={"sm"}>Alamat Polsek Terdekat</Text>}
                placeholder='Masukkan alamat polsek terdekat'
                />
                <TextInput
                label={<Text fw={"bold"} fz={"sm"}>Nomor Telepon Polsek Terdekat</Text>}
                placeholder='Masukkan nomor telepon polsek terdekat'
                />
                <TextInput
                label={<Text fw={"bold"} fz={"sm"}>Jam Aktif</Text>}
                placeholder='Masukkan jam aktif polsek terdekat'
                />
                <Box>
                  <Text fw={"bold"} fz={"sm"}>Deskripsi Polsek Terdekat</Text>
                  <KeamananEditor
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

          </Box>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default CreatePolsekTerdekat;
