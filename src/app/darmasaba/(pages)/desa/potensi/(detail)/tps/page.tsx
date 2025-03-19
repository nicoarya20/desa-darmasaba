import colors from '@/con/colors';
import { Stack, Box, Container, Text, Image, ListItem, List } from '@mantine/core';
import React from 'react';
import BackButton from '../../../layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"} px={{ base: "md", md: 0 }}>
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Container w={{ base: "100%", md: "50%" }} >
        <Box pb={20}>
          <Text ta={"center"} fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
            TPS3R Pudak Mesari
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
            fz={"1.5rem"}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Text>
        </Box>
        <Image src="/api/img/tps.png" alt='' w={"100%"} />
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Text py={20} fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          TPS3R Pudak Mesari adalah Tempat Pengolahan Sampah dengan konsep Reduce, Reuse, dan Recycle (TPS3R) yang berlokasi di Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung, Bali. Fasilitas ini berperan penting dalam pengelolaan sampah berbasis masyarakat, dengan tujuan mengurangi volume sampah yang masuk ke Tempat Pembuangan Akhir (TPA) dan meningkatkan kesadaran warga tentang pentingnya pengelolaan sampah yang berkelanjutan.
        </Text>
        <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Potensi Desa melalui TPS3R Pudak Mesari:
        </Text>
        <List py={20} type='ordered'>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Peningkatan Kesehatan Lingkungan:</Text> Dengan pengelolaan sampah yang efektif, desa dapat menjaga kebersihan lingkungan, mengurangi risiko penyakit, dan menciptakan suasana yang lebih nyaman bagi warga.
          </ListItem>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Pemberdayaan Ekonomi Masyarakat:</Text> TPS3R membuka peluang usaha bagi warga melalui pemilahan dan pengolahan sampah, seperti produksi kompos dari sampah organik dan kerajinan tangan dari sampah anorganik yang dapat meningkatkan pendapatan masyarakat.
          </ListItem>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Edukasi dan Kesadaran Lingkungan:</Text> Fasilitas ini dapat menjadi pusat edukasi bagi masyarakat tentang pentingnya pengelolaan sampah, mendorong partisipasi aktif dalam menjaga kelestarian lingkungan.
          </ListItem>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Pengembangan Pariwisata Berkelanjutan:</Text> Dengan lingkungan yang bersih dan asri, Desa Darmasaba memiliki potensi untuk menarik wisatawan yang tertarik pada ekowisata dan budaya lokal, sehingga meningkatkan perekonomian desa.
          </ListItem>
        </List>
      </Box>
    </Stack>
  );
}

export default Page;
