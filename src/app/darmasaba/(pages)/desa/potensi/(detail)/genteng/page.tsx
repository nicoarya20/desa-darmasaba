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
            Genteng
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
            fz={"1.5rem"}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Text>
        </Box>
        <Image src="/api/img/genteng.jpeg" alt='' w={"100%"} />
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Text py={20} fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Desa Darmasaba, yang terletak di Kecamatan Abiansemal, Kabupaten Badung, memiliki potensi besar dalam industri genteng yang dikelola oleh Usaha Mikro, Kecil, dan Menengah (UMKM). Sebagai desa yang masih mempertahankan nilai-nilai tradisional dalam pembangunan, industri genteng di Darmasaba berperan penting dalam penyediaan bahan bangunan berkualitas bagi masyarakat lokal maupun luar daerah.
        </Text>
        <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Potensi dan Peran UMKM Genteng:
        </Text>
        <List py={20} type='ordered'>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Genteng Tradisional Berkualitas Tinggi</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>UMKM di Darmasaba memproduksi genteng dari bahan baku pilihan seperti tanah liat berkualitas, yang menghasilkan genteng dengan daya tahan tinggi, kuat, dan cocok untuk iklim tropis. Beberapa jenis genteng yang dihasilkan meliputi:</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Genteng Tanah Liat : Kuat, tahan lama, dan memiliki estetika khas tradisional.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Genteng Beton : Cocok untuk bangunan modern dengan ketahanan lebih tinggi.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Genteng Keramik : Memberikan tampilan elegan dan daya serap air yang lebih rendah.</Text>
          </ListItem>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Peluang Ekonomi dan Pemberdayaan Masyarakat:</Text>Industri genteng di Darmasaba memberikan peluang kerja bagi masyarakat setempat, terutama dalam bidang produksi, distribusi, hingga pemasaran. UMKM genteng juga mendukung keberlanjutan ekonomi desa dengan meningkatkan pendapatan warga serta mengurangi angka pengangguran.
          </ListItem>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Inovasi dan Pengembangan Teknologi</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>Beberapa pengrajin genteng di Darmasaba telah mulai mengadopsi teknologi modern dalam proses produksi, seperti:</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Penggunaan cetakan dan oven pembakaran efisien untuk meningkatkan kualitas dan kapasitas produksi.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Teknik pelapisan anti bocor dan anti lumut untuk membuat genteng lebih tahan lama.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Desain genteng inovatif yang lebih ringan dan mudah dipasang.</Text>
          </ListItem>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Pemasaran dan Ekspansi Pasar</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>Dengan meningkatnya pembangunan perumahan dan proyek konstruksi di Bali, permintaan akan genteng berkualitas terus bertambah. UMKM genteng Darmasaba dapat memperluas pasarnya dengan:</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Menjalin kerja sama dengan kontraktor dan pengembang properti.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Mempromosikan produk melalui media sosial dan marketplace online.</Text>
            <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}> - Menyediakan layanan custom sesuai kebutuhan pelanggan.</Text>
          </ListItem>
          <ListItem fz={{ base: "sm", md: "lg" }} ta={"justify"}>
            <Text fz={{ base: "sm", md: "lg" }} fw={"bold"}>Keberlanjutan dan Ramah Lingkungan:</Text>Industri genteng di Darmasaba berpotensi dikembangkan secara lebih ramah lingkungan dengan menerapkan metode produksi yang mengurangi limbah dan emisi. Pemanfaatan energi alternatif serta daur ulang bahan limbah dapat membantu menciptakan industri yang lebih berkelanjutan.
          </ListItem>
        </List>
        <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          UMKM genteng di Desa Darmasaba memiliki potensi besar untuk terus berkembang sebagai sektor industri unggulan. Dengan inovasi, pemasaran yang lebih luas, serta dukungan dari pemerintah dan masyarakat, industri ini dapat meningkatkan kesejahteraan warga dan memperkuat perekonomian desa.
        </Text>
      </Box>
    </Stack>
  );
}

export default Page;
