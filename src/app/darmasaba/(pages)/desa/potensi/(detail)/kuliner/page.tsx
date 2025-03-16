import colors from '@/con/colors';
import { Stack, Container, Box, List, ListItem, Text, Image } from '@mantine/core';
import React from 'react';
import BackButton from '../../../layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} px={{ base: "md", md: 0 }} gap={"42"} >
      <Container w={{ base: "100%", md: "50%" }} >
        <BackButton />
        <Box pb={20}>
          <Text ta={"center"} fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
            Kawasan Kuliner
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
            fz={"1.5rem"}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Text>
        </Box>
        <Image src="/api/img/warungumkm.jpg" alt='' w={"100%"} h={400} />
        <Text py={20} fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Desa Darmasaba, yang terletak di Kecamatan Abiansemal, Kabupaten Badung, Bali, memiliki potensi besar dalam sektor kuliner. Sebagai desa yang strategis dan terus berkembang, Darmasaba mulai dikenal sebagai destinasi kuliner yang menawarkan beragam makanan khas Bali hingga makanan modern yang menarik minat wisatawan dan masyarakat lokal.
        </Text>
        <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Potensi Desa melalui Kawasan Kuliner:
        </Text>
        <List py={20} type='ordered'>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Ragam Kuliner Khas Bali</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>Darmasaba memiliki banyak warung dan rumah makan yang menyajikan hidangan khas Bali yang otentik, seperti:</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Babi Guling : Salah satu kuliner favorit di Bali yang banyak ditemukan di Darmasaba.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Ayam Betutu : Hidangan ayam berbumbu khas yang dimasak dengan teknik khas Bali.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Lawar : Campuran daging dan sayuran berbumbu khas Bali.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Sate Lilit : Sate khas Bali yang terbuat dari daging cincang yang dibalut pada batang serai.</Text>
          </ListItem>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Wisata Kuliner Modern & Cafe Kekinian:</Text>Selain makanan tradisional, Darmasaba juga mulai berkembang dengan hadirnya cafe dan resto kekinian yang menyajikan menu modern seperti kopi spesial, burger, pizza, dan aneka dessert yang digemari anak muda. Keberadaan tempat-tempat ini menjadikan Darmasaba sebagai pilihan destinasi kuliner bagi wisatawan maupun warga sekitar.
          </ListItem>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Pasar Kuliner Malam:</Text>Salah satu daya tarik Darmasaba adalah pusat kuliner malam yang menghadirkan aneka makanan kaki lima seperti nasi jinggo, tipat cantok, bakso, dan berbagai jajanan khas Bali. Suasana yang ramai dan harga yang terjangkau membuat pasar kuliner ini menjadi tempat favorit bagi masyarakat lokal.
          </ListItem>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Potensi Ekonomi & UMKM Kuliner:</Text>Dengan berkembangnya sektor kuliner, banyak pelaku UMKM di Darmasaba mulai merintis usaha makanan, baik dalam bentuk warung makan, katering, hingga produksi makanan ringan seperti keripik, sambal, dan minuman tradisional. Potensi ini dapat terus dikembangkan dengan dukungan pemerintah desa dan promosi melalui media sosial.
          </ListItem>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Kawasan Kuliner Berbasis Pariwisata:</Text>Untuk menarik lebih banyak pengunjung, Darmasaba berpotensi mengembangkan kawasan kuliner berbasis wisata yang menggabungkan pengalaman makan dengan konsep alam terbuka, pertunjukan seni, dan edukasi kuliner khas Bali. Hal ini dapat menjadi daya tarik tambahan bagi wisatawan yang ingin merasakan pengalaman kuliner yang lebih autentik.
          </ListItem>
        </List>
        <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Dengan kekayaan kuliner yang dimiliki, Desa Darmasaba berpotensi menjadi kawasan kuliner unggulan di Kabupaten Badung. Dukungan dari masyarakat, pemerintah desa, serta promosi yang lebih luas dapat menjadikan Darmasaba sebagai destinasi kuliner yang semakin dikenal dan berkembang.
        </Text>
      </Container>
    </Stack>
  );
}

export default Page;
