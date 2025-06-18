'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Stack, Text } from '@mantine/core';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailLowonganKerjaLokal() {
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
          <Text fz={"xl"} fw={"bold"}>Detail Lowongan Kerja Lokal</Text>

          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
             <Box>
             <Text fw={"bold"}>Bekerja Sebagai</Text>
             <Text>Karyawan</Text>
             </Box>
             <Box>
             <Text fw={"bold"}>Nama Usaha</Text>
             <Text>BIBD</Text>
             </Box>
             <Box>
             <Text fw={"bold"}>Alamat Usaha</Text>
             <Text>Jalan In Aja</Text>
             </Box>
             <Box>
             <Text fw={"bold"}>Nomor Telepon</Text>
             <Text>0896232831883</Text>
             </Box>
             <Box>
             <Text fw={"bold"}>Waktu Kerja</Text>
             <Text>Full Time</Text>
             </Box>
             <Box>
             <Text fw={"bold"}>Gaji selama 1 bulan</Text>
             <Text>Rp. 3.000.000</Text>
             </Box>
             <Box>
             <Text fw={"bold"}>Deskripsi Lowongan Kerja</Text>
             <Text> Pekerjaan dengan gaji Rp. 3.000.000</Text>
             </Box>
              <Box>
                <Flex gap={"xs"}>
                  <Button color="red">
                    <IconX size={20} />
                  </Button>
                  <Button onClick={() => router.push('/admin/ekonomi/lowongan-kerja-lokal/edit')} color="green">
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

export default DetailLowonganKerjaLokal;

