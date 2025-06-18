'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Stack, Text } from '@mantine/core';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailProgramKemiskinan() {
  const router = useRouter();
  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper w={{ base: "100%", md: "50%" }} bg={colors['white-1']} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail Program Kemiskinan</Text>

          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
             <Box>
             <Text fw={"bold"}>Judul Program</Text>
             <Text>Program A</Text>
             </Box>
             <Box>
             <Text fw={"bold"}>Deskripsi Singkat</Text>
             <Text>Deskripsi Program A</Text>
             </Box>
             <Box>
             <Text fw={"bold"}>Jumlah Masyarakat Miskin</Text>
             <Text>100</Text>
             </Box>
             <Box>
             <Text fw={"bold"}>Deskripsi</Text>
             <Text>Deskripsi Program A</Text>
             </Box>
              <Box>
                <Flex gap={"xs"}>
                  <Button color="red">
                    <IconX size={20} />
                  </Button>
                  <Button onClick={() => router.push('/admin/ekonomi/program-kemiskinan/edit')} color="green">
                    <IconEdit size={20} />
                  </Button>
                </Flex>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Hapus
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus potensi ini?"
      /> */}
    </Box>
  );
}

export default DetailProgramKemiskinan;

