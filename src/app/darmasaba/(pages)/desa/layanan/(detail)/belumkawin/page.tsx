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
            Surat Keterangan Belum Kawin
          </Text>
          <Text fz={"h4"} py={20}>
            Persyaratan Dokumen:
          </Text>
          <List>
            <ListItem fz={"sm"}>Pengantar Kelian Banjar Dinas di Wilayah Masing - masing</ListItem>
            <ListItem fz={"sm"}>Fotocopy Ktp atau Kartu Keluarga</ListItem>
            <ListItem fz={"sm"}>Khusus bagi yang berstatus duda atau janda melampirkan fotocopy akta cerai atau dokumen pendukung lainnya</ListItem>
          </List>
          <Box py={20}>
            <Text fz={"h4"} py={20}>
              Alur Pelayanan:
            </Text>
            <Image src="/api/img/flowchart-suket-beda-biodatadiri-removebg-preview.png" alt='' />
          </Box>
          <Button radius={"lg"} fz={'h4'} bg={colors['blue-button']}>Ajukan Permohonan</Button>
        </Stack>
      </Container>
    </Stack>
  );
}

export default Page;
