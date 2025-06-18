'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Stack, Text } from '@mantine/core';
import { IconArrowBack, IconEdit, IconImageInPicture, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailDesaDigital() {
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
          <Text fz={"xl"} fw={"bold"}>Detail Desa Digital Smart Village</Text>

          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fw={"bold"}>Nama Inovasi</Text>
                <Text>Pelayanan Admin Digital</Text>
              </Box>
              <Box>
                <Text fw={"bold"}>Deskripsi Singkat Inovasi</Text>
                <Text>Deskripsi Singkat Inovasi</Text>
              </Box>
              <Box>
                <Text fw={"bold"}>Image</Text>
                <IconImageInPicture size={20} />
              </Box>
              <Box>
                <Text fw={"bold"}>Deskripsi Inovasi</Text>
                <Text>Deskripsi Inovasi</Text>
              </Box>
              <Box>
                <Flex gap={"xs"}>
                  <Button color="red">
                    <IconX size={20} />
                  </Button>
                  <Button onClick={() => router.push('/admin/inovasi/desa-digital-smart-village/edit')} color="green">
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

export default DetailDesaDigital;

