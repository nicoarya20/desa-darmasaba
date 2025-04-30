import colors from '@/con/colors';
import { Box, Button, Center, Container, Image, List, ListItem, Stack, Text } from '@mantine/core';
import BackButton from '../../_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.grey[1]} py={"xl"} gap={"22"}>
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: "100%", md: "50%" }} >
        <Text fz={{base: "2rem", md: "2.5rem", lg: "3rem", xl: "3.4rem"}} ta={"center"} fw={"bold"}>
          Surat Keterangan Domisili Organisasi
        </Text>
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={0} >
          <Text fz={{ base: "h4", md: "h2" }} pb={20}>
            Persyaratan Dokumen:
          </Text>
          <List>
            <ListItem fz={{ base: "sm", md: "h3" }}>Pengantar Kelian Banjar Dinas di Wilayah Masing - masing</ListItem>
            <ListItem fz={{ base: "sm", md: "h3" }}>Fotocopy Surat Keterangan Terdaftar (SKT) organisasi atau Pengukuhan Kelompok</ListItem>
            <ListItem fz={{ base: "sm", md: "h3" }}>Jika Pengajuan baru pembuatan SKT maka melengkapi Susunan Pengurus lengkap dengan Kop Organisasi</ListItem>
            <ListItem fz={{ base: "sm", md: "h3" }}>Tanggal berdiri/Tahun berdiri/Sejak kapan berdirinya organisasi</ListItem>
          </List>
          <Box py={20}>
            <Text fz={{ base: "h4", md: "h2" }} py={20}>
              Alur Pelayanan:
            </Text>
            <Center>
              <Image src="/api/img/flowchart-suket-beda-biodatadiri-removebg-preview.png" alt='' />
            </Center>
          </Box>
          <Button radius={"lg"} fz={'h4'} bg={colors['blue-button']}>Ajukan Permohonan</Button>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
