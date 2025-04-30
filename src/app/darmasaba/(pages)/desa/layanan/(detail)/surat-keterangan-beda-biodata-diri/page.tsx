import colors from '@/con/colors';
import { Stack, Container, List, ListItem, Box, Text, Image, Button, Center, Group } from '@mantine/core';
import React from 'react';
import BackButton from '../../_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.grey[1]} py={"xl"} gap={"22"}>
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Container w={{ base: "100%", md: "50%" }} >
        <Text fz={{base: "2rem", md: "2.5rem", lg: "3rem", xl: "3.4rem"}} ta={"center"} fw={"bold"}>
          Surat Keterangan Beda Biodata Diri
        </Text>
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={0}>
          <Text fz={{ base: "h4", md: "h2" }} pb={20}>
            Persyaratan Dokumen:
          </Text>
          <List>
            <ListItem fz={{ base: "sm", md: "h3" }}>Pengantar Kelian Banjar Dinas di Wilayah Masing - masing</ListItem>
            <ListItem fz={{ base: "sm", md: "h3" }}>Fotocopy Ktp atau Kartu Keluarga</ListItem>
            <ListItem fz={{ base: "sm", md: "h3" }}>Fotocopy dokumen bersangkutan yang terdapat perbedaan biodata diri misal : Sertifikat Tanah/Ijazah/Polis Asuransi dan lainnya.</ListItem>
          </List>
          <Box py={20}>
            <Text fz={{ base: "h4", md: "h2" }} py={20}>
              Alur Pelayanan:
            </Text>
            <Center>
              <Image src="/api/img/flowchart-suket-beda-biodatadiri-removebg-preview.png" alt='' />
            </Center>
          </Box>
          <Group justify='center'>
            <Button radius={"lg"} fz={'h4'} bg={colors['blue-button']}>Ajukan Permohonan</Button>
          </Group>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
