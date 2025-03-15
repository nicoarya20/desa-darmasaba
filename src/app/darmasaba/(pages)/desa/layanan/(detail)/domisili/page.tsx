import colors from '@/con/colors';
import { Box, Button, Container, Image, List, ListItem, Stack, Text } from '@mantine/core';
import BackButton from '../../_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.grey[1]} py={"xl"} gap={"42"}>
      <Container w={{ base: "100%", md: "50%" }} p={"xl"}>
        <BackButton/>
        <Stack gap={0}>
          <Text fz={"3.4rem"} ta={"center"} fw={"bold"}>
            Surat Keterangan Domisili Organisasi
          </Text>
          <Text fz={"h4"} py={20}>
            Persyaratan Dokumen:
          </Text>
          <List>
            <ListItem fz={"sm"}>Pengantar Kelian Banjar Dinas di Wilayah Masing - masing</ListItem>
            <ListItem fz={"sm"}>Fotocopy Surat Keterangan Terdaftar (SKT) organisasi atau Pengukuhan Kelompok</ListItem>
            <ListItem fz={"sm"}>Jika Pengajuan baru pembuatan SKT maka melengkapi Susunan Pengurus lengkap dengan Kop Organisasi</ListItem>
            <ListItem fz={"sm"}>Tanggal berdiri/Tahun berdiri/Sejak kapan berdirinya organisasi</ListItem>
          </List>
          <Box py={20}>
          <Text fz={"h4"} py={20}>
            Alur Pelayanan:
          </Text>
          <Image src="/api/img/flowchart-suket-beda-biodatadiri-removebg-preview.png" alt=''/>
          </Box>
          <Button radius={"lg"} fz={'h4'} bg={colors['blue-button']}>Ajukan Permohonan</Button>
        </Stack>
      </Container>
    </Stack>
  );
}

export default Page;
