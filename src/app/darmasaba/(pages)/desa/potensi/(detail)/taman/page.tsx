import colors from '@/con/colors';
import { Stack, Container, Box, List, ListItem, Text, Image } from '@mantine/core';
import React from 'react';
import BackButton from '../../../layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"42"} >
      <Container w={{ base: "100%", md: "50%" }} >
        <BackButton />
        <Box pb={20}>
          <Text ta={"center"} fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
            Taman Beji Cengana
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Text>
        </Box>
        <Image src="/api/img/taman-beji.jpg" alt='' w={"100%"} h={400} />
        <Text py={20} fz={"sm"} ta={"justify"}>
          Taman Beji Cengana, terletak di Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung, Bali, adalah situs suci yang memiliki nilai spiritual dan sejarah yang tinggi. Tempat ini dikenal sebagai lokasi untuk ritual pembersihan diri (melukat) dan peribadatan oleh umat Hindu Bali. Keberadaan mata air suci (Tirta Klebutan) di Taman Beji Cengana dipercaya memberikan berkah dan penyucian bagi mereka yang datang untuk berdoa dan melakukan ritual.
        </Text>
        <Text fz={"sm"} ta={"justify"}>
          Potensi Desa melalui Taman Beji Cengana:
        </Text>
        <List py={20} type='ordered'>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Pengembangan Pariwisata Spiritual:</Text> Taman Beji Cengana memiliki potensi besar sebagai destinasi wisata spiritual. Wisatawan yang mencari pengalaman spiritual dan ketenangan batin dapat tertarik untuk mengunjungi tempat ini, mengikuti ritual melukat, dan merasakan suasana sakral yang ditawarkan.
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Pelestarian Budaya dan Tradisi:</Text>Dengan mempromosikan Taman Beji Cengana sebagai pusat kegiatan budaya dan ritual tradisional, desa dapat memastikan bahwa warisan budaya dan tradisi lokal tetap lestari.
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Pendidikan dan Penelitian:</Text>Taman Beji Cengana dapat dijadikan sebagai pusat pendidikan dan penelitian bagi akademisi, peneliti, dan pelajar yang tertarik mempelajari budaya, agama, dan sejarah Bali.
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Pengembangan Ekonomi Kreatif:</Text>Dengan meningkatnya jumlah pengunjung ke Taman Beji Cengana, peluang bagi pengembangan ekonomi kreatif juga terbuka lebar. Masyarakat lokal dapat mengembangkan produk kerajinan tangan, kuliner khas, dan suvenir yang mencerminkan budaya dan tradisi desa.
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Konservasi Lingkungan:</Text>Sebagai situs suci dengan mata air alami, Taman Beji Cengana memiliki peran penting dalam konservasi lingkungan. Upaya menjaga kebersihan dan kelestarian mata air serta lingkungan sekitarnya dapat menjadi contoh praktik konservasi yang baik.
          </ListItem>
        </List>
        <Text fz={"sm"} ta={"justify"}>
          Dengan memanfaatkan potensi yang dimiliki Taman Beji Cengana, Desa Darmasaba dapat mengembangkan sektor pariwisata, budaya, pendidikan, ekonomi, dan lingkungan secara berkelanjutan, yang pada gilirannya akan meningkatkan kesejahteraan masyarakat dan pelestarian warisan budaya.
        </Text>
      </Container>
    </Stack>
  );
}

export default Page;
