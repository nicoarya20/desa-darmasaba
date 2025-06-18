'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Flex, Text, Image } from '@mantine/core';
import { IconArrowBack, IconX, IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React from 'react';
// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailKeamananLingkungan() {
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
          <Text fz={"xl"} fw={"bold"}>Detail Keamanan Lingkungan</Text>

          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Nama Keamanan Lingkungan</Text>
                <Text fz={"lg"}>Test Judul</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Nomor Keamanan Lingkungan</Text>
                <Text fz={"lg"}>Test Kategori</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Deskripsi</Text>
                <Text fz={"lg"}>Test Deskripsi</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Gambar</Text>
                <Image src={"/"} alt="gambar" />
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Konten</Text>
                <Text fz={"lg"} >Test Konten</Text>
              </Box>
              <Box>
                <Flex gap={"xs"}>
                  <Button color="red">
                    <IconX size={20} />
                  </Button>
                  <Button onClick={() => router.push('/admin/keamanan/keamanan-lingkungan-pecalang-patwal/edit')} color="green">
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

export default DetailKeamananLingkungan;
