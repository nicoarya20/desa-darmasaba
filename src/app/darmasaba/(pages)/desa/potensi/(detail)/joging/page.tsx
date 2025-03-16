import colors from '@/con/colors';
import { Stack, Container, Box, List, ListItem, Text, Image } from '@mantine/core';
import React from 'react';
import BackButton from '../../../layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"42"} px={{ base: "md", md: 0 }}>
      <Container w={{ base: "100%", md: "50%" }} >
        <BackButton />
        <Box pb={20}>
          <Text ta={"center"} fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
          Jogging Track Tegeh Aban, Karang Gadon dan Munduk Uma Desa
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
            fz={"1.5rem"}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Text>
        </Box>
        <Image src="/api/img/jogging.jpg" alt='' w={"100%"} />
        <Text py={20} fz={{base: "sm", md: "lg"}} ta={"justify"}>
          Desa Darmasaba, yang terletak di Kecamatan Abiansemal, Kabupaten Badung, memiliki potensi wisata olahraga dan rekreasi melalui Jogging Track Tegeh Aban, Karang Gadon, dan Munduk Uma Desa. Jalur jogging ini tidak hanya menjadi fasilitas olahraga bagi warga, tetapi juga berpotensi dikembangkan sebagai destinasi wisata sehat berbasis alam yang menarik bagi wisatawan lokal maupun luar daerah.
        </Text>
        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>
          Potensi dan Peran Jogging Track Tegeh Aban, Karang Gadon dan Munduk Uma Desa:
        </Text>
        <List py={20} type='ordered'>
          <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Keindahan Alam dan Udara Segar:</Text>Jogging track yang membentang di Tegeh Aban, Karang Gadon, dan Munduk Uma Desa menawarkan pemandangan alam yang asri dengan udara segar khas pedesaan. Jalur ini melewati area persawahan hijau, perkebunan, serta hutan kecil yang memberikan pengalaman jogging yang lebih menyenangkan dan menenangkan.
          </ListItem>
          <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Fasilitas Olahraga dan Rekreasi </Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>Selain untuk jogging, jalur ini juga cocok digunakan untuk:</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Bersepeda santai : Jalur yang nyaman untuk pecinta sepeda.</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Trekking ringan : Cocok bagi wisatawan yang ingin menikmati suasana pedesaan.</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Meditasi dan Yoga : Area yang tenang dan alami, ideal untuk relaksasi.</Text>
          </ListItem>
          <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Destinasi Wisata Sehat dan Edukasi:</Text>Jogging track ini berpotensi dikembangkan sebagai wisata sehat berbasis alam, di mana pengunjung bisa menikmati udara segar sambil berolahraga. Selain itu, jalur ini dapat dijadikan sebagai rute edukasi lingkungan, mengenalkan keanekaragaman hayati, pertanian, serta kehidupan masyarakat desa.
          </ListItem>
          <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Potensi Ekonomi bagi Masyarakat </Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>Dengan meningkatnya jumlah pengunjung, masyarakat sekitar dapat memanfaatkan peluang usaha seperti:</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Warung sehat dan kuliner lokal : Menyediakan makanan dan minuman sehat bagi para pengunjung.</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Jasa penyewaan sepeda : Menarik bagi wisatawan yang ingin berkeliling lebih jauh.</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Pemandu wisata lokal : Memberikan pengalaman lebih bagi wisatawan yang ingin mengenal sejarah dan budaya desa.</Text>
          </ListItem>
          <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
          <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Pengembangan Berkelanjutan:</Text>Agar semakin menarik, jogging track ini bisa dilengkapi dengan fasilitas tambahan seperti tempat istirahat, spot foto alami, papan informasi tentang flora dan fauna, serta area taman bunga untuk mempercantik jalur jogging.
          </ListItem>
        </List>
        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>
        Jogging Track Tegeh Aban, Karang Gadon, dan Munduk Uma Desa memiliki potensi besar sebagai destinasi wisata sehat dan olahraga berbasis alam. Dengan pengelolaan yang baik serta dukungan dari pemerintah desa dan masyarakat, jalur ini bisa menjadi ikon baru Desa Darmasaba yang menarik bagi wisatawan serta meningkatkan perekonomian warga setempat.
        </Text>
      </Container>
    </Stack>
  );
}

export default Page;
