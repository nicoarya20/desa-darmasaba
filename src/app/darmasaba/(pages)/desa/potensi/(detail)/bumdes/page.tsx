import colors from '@/con/colors';
import { Stack, Container, Box, List, ListItem, Text, Image } from '@mantine/core';
import React from 'react';
import BackButton from '../../../layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"42"} px={{base: "md", md: 0}}>
      <Container w={{ base: "100%", md: "50%" }} >
        <BackButton />
        <Box pb={20}>
          <Text ta={"center"} fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
            Bumdes Pudak Mesari
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
            fz={"1.5rem"}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Text>
        </Box>
        <Image src="/api/img/ack.png" alt='' w={"100%"} />
        <Text py={20} fz={{base: "sm", md: "lg"}} ta={"justify"}>
        Badan Usaha Milik Desa (BUMDes) Pudak Mesari adalah lembaga ekonomi desa yang berperan penting dalam pengembangan potensi dan kesejahteraan masyarakat Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung, Bali. BUMDes ini berfungsi sebagai motor penggerak perekonomian desa melalui berbagai unit usaha yang dikelola secara profesional.
        </Text>
        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>
        Potensi dan Peran BUMDes Pudak Mesari:
        </Text>
        <List py={20} type='ordered'>
          <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Pengembangan Usaha Mikro dan Kecil:</Text>BUMDes Pudak Mesari menyediakan layanan bagi pelaku usaha mikro dan kecil di desa, seperti penyediaan konsumsi dan snack kotak untuk berbagai acara. 
          </ListItem>
          <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Pengelolaan Sampah Berbasis Masyarakat:</Text>Melalui kolaborasi dengan komunitas pemuda peduli lingkungan, BUMDes Pudak Mesari aktif dalam pengelolaan sampah berbasis masyarakat.
          </ListItem>
          <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Peningkatan Kapasitas dan Transparansi:</Text>Untuk memastikan pengelolaan yang akuntabel, BUMDes Pudak Mesari rutin mengadakan rapat koordinasi dan pendampingan penyusunan laporan pertanggungjawaban.
          </ListItem>
          <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Kolaborasi Internasional:</Text>Desa Darmasaba, melalui BUMDes Pudak Mesari, menerima kunjungan dari tim Osaki Jepang untuk memperkuat pengelolaan sampah dan lingkungan.
          </ListItem>
        </List>
        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>
        Dengan berbagai inisiatif tersebut, BUMDes Pudak Mesari menunjukkan perannya sebagai pilar utama dalam pengembangan ekonomi dan kesejahteraan masyarakat Desa Darmasaba, sekaligus menjaga kelestarian lingkungan melalui program-program inovatif dan kolaboratif.
        </Text>
      </Container>
    </Stack>
  );
}

export default Page;
