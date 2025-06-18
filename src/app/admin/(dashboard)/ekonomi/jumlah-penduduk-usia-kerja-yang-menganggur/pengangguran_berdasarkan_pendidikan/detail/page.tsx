'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Stack, Text } from '@mantine/core';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailPengangguranBerdasarkanPendidikan() {
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
          <Text fz={"xl"} fw={"bold"}>Detail Pengangguran Berdasarkan Pendidikan</Text>

          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
             <Box>
             <Text fw={"bold"}>Pendidikan SD</Text>
             <Text>50</Text>
             </Box>
             <Box>
             <Text fw={"bold"}>Pendidikan SMP</Text>
             <Text>60</Text>
             </Box>
             <Box>
             <Text fw={"bold"}>Pendidikan SMA</Text>
             <Text>80</Text>
             </Box>
             <Box>
             <Text fw={"bold"}>Pendidikan S1</Text>
             <Text>40</Text>
             </Box>
             <Box>
             <Text fw={"bold"}>Pendidikan S2</Text>
             <Text>20</Text>
             </Box>
             <Box>
             <Text fw={"bold"}>Pendidikan S3</Text>
             <Text>10</Text>
             </Box>
              <Box>
                <Flex gap={"xs"}>
                  <Button color="red">
                    <IconX size={20} />
                  </Button>
                  <Button onClick={() => router.push('/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_pendidikan/edit')} color="green">
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

export default DetailPengangguranBerdasarkanPendidikan;

