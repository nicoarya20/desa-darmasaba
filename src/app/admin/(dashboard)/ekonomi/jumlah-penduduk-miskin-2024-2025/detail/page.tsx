'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Stack, Text } from '@mantine/core';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailJumlahPendudukMiskin() {
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
          <Text fz={"xl"} fw={"bold"}>Detail Jumlah Penduduk Miskin</Text>

          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fw={"bold"}>Tahun</Text>
                <Text>2024</Text>
              </Box>
              <Box>
                <Text fw={"bold"}>Jumlah Penduduk Miskin</Text>
                <Text>100</Text>
              </Box>
              <Box>
                <Flex gap={"xs"}>
                  <Button color="red">
                    <IconX size={20} />
                  </Button>
                  <Button onClick={() => router.push('/admin/ekonomi/jumlah-penduduk-miskin-2024-2025/edit')} color="green">
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

export default DetailJumlahPendudukMiskin;

