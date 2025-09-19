import colors from '@/con/colors';
import { Stack, Box, Container, Text, Image, ListItem, List } from '@mantine/core';
import React from 'react';
import BackButton from '../darmasaba/(pages)/desa/layanan/_com/BackButto';


function Page() {
    return (
      <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"} px={{ base: "md", md: 0 }}>
        <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
        <Container w={{ base: "100%", md: "50%" }} >
          <Box pb={20}>
            <Text ta={"center"} fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
              Taman Beji Cengana
            </Text>
            <Text
              ta={"center"}
              fw={"bold"}
              fz={"1.5rem"}
            >
              Informasi dan Pelayanan Administrasi Digital
            </Text>
          </Box>
          <Image src="/api/img/taman-beji.jpg" alt='' w={"100%"} h={400} />
        </Container>
        <Box px={{ base: "md", md: 100 }}>
          <Text py={20} fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            Taman Beji Cengana, terletak di Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung, Bali, adalah situs suci yang memiliki nilai spiritual dan sejarah yang tinggi. Tempat ini dikenal sebagai lokasi untuk ritual pembersihan diri (melukat) dan peribadatan oleh umat Hindu Bali. Keberadaan mata air suci (Tirta Klebutan) di Taman Beji Cengana dipercaya memberikan berkah dan penyucian bagi mereka yang datang untuk berdoa dan melakukan ritual.
          </Text>
          <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            Potensi Desa melalui Taman Beji Cengana:
          </Text>
          <List py={20} type='ordered'>
            <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
              <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Pengembangan Pariwisata Spiritual:</Text> Taman Beji Cengana memiliki potensi besar sebagai destinasi wisata spiritual. Wisatawan yang mencari pengalaman spiritual dan ketenangan batin dapat tertarik untuk mengunjungi tempat ini, mengikuti ritual melukat, dan merasakan suasana sakral yang ditawarkan.
            </ListItem>
            <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
              <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Pelestarian Budaya dan Tradisi:</Text>Dengan mempromosikan Taman Beji Cengana sebagai pusat kegiatan budaya dan ritual tradisional, desa dapat memastikan bahwa warisan budaya dan tradisi lokal tetap lestari.
            </ListItem>
            <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
              <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Pendidikan dan Penelitian:</Text>Taman Beji Cengana dapat dijadikan sebagai pusat pendidikan dan penelitian bagi akademisi, peneliti, dan pelajar yang tertarik mempelajari budaya, agama, dan sejarah Bali.
            </ListItem>
            <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
              <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Pengembangan Ekonomi Kreatif:</Text>Dengan meningkatnya jumlah pengunjung ke Taman Beji Cengana, peluang bagi pengembangan ekonomi kreatif juga terbuka lebar. Masyarakat lokal dapat mengembangkan produk kerajinan tangan, kuliner khas, dan suvenir yang mencerminkan budaya dan tradisi desa.
            </ListItem>
            <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
              <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Konservasi Lingkungan:</Text>Sebagai situs suci dengan mata air alami, Taman Beji Cengana memiliki peran penting dalam konservasi lingkungan. Upaya menjaga kebersihan dan kelestarian mata air serta lingkungan sekitarnya dapat menjadi contoh praktik konservasi yang baik.
            </ListItem>
          </List>
          <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            Dengan memanfaatkan potensi yang dimiliki Taman Beji Cengana, Desa Darmasaba dapat mengembangkan sektor pariwisata, budaya, pendidikan, ekonomi, dan lingkungan secara berkelanjutan, yang pada gilirannya akan meningkatkan kesejahteraan masyarakat dan pelestarian warisan budaya.
          </Text>
        </Box>
      </Stack>
    );
  }

export default Page;
