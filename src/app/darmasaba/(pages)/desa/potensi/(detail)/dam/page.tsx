import colors from '@/con/colors';
import { Stack, Container, Box, List, ListItem, Text, Image } from '@mantine/core';
import React from 'react';
import BackButton from '../../../layanan/_com/BackButto';

function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"} px={{ base: "md", md: 0 }}>
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Container w={{ base: "100%", md: "50%" }} >
        <Box pb={20}>
          <Text ta={"center"} fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
            Dam Tanah Putih
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
            fz={"1.5rem"}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Text>
        </Box>
        <Image src="/api/img/damtanahputih.jpeg" alt='' w={"100%"} />
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Text py={20} fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Desa Darmasaba, yang terletak di Kecamatan Abiansemal, Kabupaten Badung, memiliki Dam Tanah Putih sebagai salah satu potensi desa yang bernilai strategis. Selain berfungsi sebagai infrastruktur pengairan, dam ini juga memiliki potensi untuk dikembangkan sebagai destinasi wisata alam, edukasi, dan rekreasi bagi masyarakat lokal maupun wisatawan.
        </Text>
        <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Potensi dan Peran Dam Tanah Putih:
        </Text>
        <List py={20} type='ordered'>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Fungsi Utama Sebagai Sumber Pengairan</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>Dam Tanah Putih memiliki peran penting dalam sistem irigasi yang menopang sektor pertanian di Darmasaba. Air dari dam ini digunakan untuk:</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Mengairi sawah dan ladang : Menjamin ketersediaan air bagi petani sepanjang tahun.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Menjaga keseimbangan ekosistem : Menjadi habitat bagi ikan air tawar dan berbagai biota air.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Menampung air hujan : Membantu mengurangi risiko banjir dan kekeringan.</Text>
          </ListItem>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Potensi Wisata Alam dan Rekreasi</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>Dengan pemandangan alam yang asri dan suasana yang sejuk, Dam Tanah Putih memiliki potensi besar untuk dikembangkan sebagai tempat wisata alam. Beberapa kegiatan yang bisa dikembangkan di area ini antara lain:</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Trekking dan jogging di sekitar dam : Menikmati udara segar dan pemandangan indah.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Berkemah dan piknik : Cocok untuk keluarga dan komunitas yang ingin menikmati alam.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Wisata air : Seperti pemancingan atau wisata perahu kecil yang dapat menarik wisatawan.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Spot fotografi alam : Keindahan dam dan sekitarnya menjadi latar yang menarik bagi para fotografer.</Text>
          </ListItem>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Potensi Ekonomi dan UMKM Lokal</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>Dengan pengembangan dam sebagai destinasi wisata, masyarakat sekitar dapat memanfaatkan peluang usaha seperti:</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Warung makan dan jajanan tradisional : Menyediakan makanan khas Bali bagi wisatawan.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Jasa penyewaan alat rekreasi : Seperti pancing atau perahu kecil.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Produk kerajinan tangan dan suvenir : Oleh-oleh khas Darmasaba yang menarik bagi pengunjung.</Text>
          </ListItem>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Pengembangan Konservasi dan Edukasi Lingkungan</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>Dam Tanah Putih juga bisa menjadi tempat edukasi lingkungan dengan konsep konservasi, di mana pengunjung bisa belajar tentang:</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Pengelolaan sumber daya air yang berkelanjutan.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Keanekaragaman hayati di sekitar dam.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Pentingnya ekosistem perairan bagi pertanian dan kehidupan masyarakat.</Text>
          </ListItem>
        </List>
        <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Dengan berbagai fungsi dan keindahannya, Dam Tanah Putih memiliki potensi besar untuk dikembangkan sebagai destinasi wisata alam, rekreasi, serta edukasi lingkungan. Dengan pengelolaan yang baik dan dukungan dari masyarakat serta pemerintah desa, dam ini dapat menjadi aset penting bagi Darmasaba, baik dari sisi ekonomi maupun kelestarian lingkungan.
        </Text>
      </Box>
    </Stack>
  );
}

export default Page;
