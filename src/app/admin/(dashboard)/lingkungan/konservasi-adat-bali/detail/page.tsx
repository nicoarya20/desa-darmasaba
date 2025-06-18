'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Stack, Text } from '@mantine/core';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailKonservasiAdatBali() {
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
          <Text fz={"xl"} fw={"bold"}>Detail Konservasi Adat Bali</Text>

          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Judul Konservasi Adat Bali</Text>
                <Text fz={"lg"}>Test Judul</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Deskripsi Konservasi Adat Bali</Text>
                <Text fz={"lg"} >Test Deskripsi</Text>
              </Box>
              <Box>
                <Flex gap={"xs"}>
                  <Button color="red">
                    <IconX size={20} />
                  </Button>
                  <Button onClick={() => router.push('/admin/lingkungan/konservasi-adat-bali/edit')} color="green">
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

export default DetailKonservasiAdatBali;
