import colors from '@/con/colors';
import { Stack, Container, List, ListItem, Box, Text, Image, Button } from '@mantine/core';
import React from 'react';
import BackButton from '../../_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.grey[1]} py={"xl"} gap={"42"}>
      <Container w={{ base: "100%", md: "50%" }} p={"xl"}>
        <BackButton/>
        <Stack gap={0}>
          <Text fz={"3.4rem"} ta={"center"} fw={"bold"}>
            Surat Keterangan Tempat Usaha
          </Text>
          <Text fz={"h4"} py={20}>
            Persyaratan Dokumen:
          </Text>
          <List>
            <ListItem fz={"sm"}>Pengantar Kelian Banjar Dinas di Wilayah Masing - masing</ListItem>
            <ListItem fz={"sm"}>Fotocopy KTP atau Kartu keluarga</ListItem>
            <ListItem fz={"sm"}>Foto Lokasi dan Kegiatan Usaha di cetak dalam selembar kertas (diparaf dan stempel oleh Kelian Banjar Dinas)</ListItem>
            <ListItem fz={"sm"}>Surat Perjanjian Sewa/Kontrak atau Kwintansi Pembayaran Sewa 3 bulan terakhir bagi yang mengontrak tempat usaha, apabila tempat usaha milik sendiri lampiri dengan dokumen kepemilikan tempat usaha (dapat berupa fotocopy sppt atau Fotocopy Sertipikat Hak Milik)</ListItem>
          </List>
          <Box py={20}>
            <Text fz={"h4"} py={20}>
              Alur Pelayanan:
            </Text>
            <Image src="/api/img/flowchart-suket-tempat-usaha-removebg-preview.png" alt='' />
          </Box>
          <Button radius={"lg"} fz={'h4'} bg={colors['blue-button']}>Ajukan Permohonan</Button>
        </Stack>
      </Container>
    </Stack>
  );
}

export default Page;
