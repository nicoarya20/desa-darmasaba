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
            Genteng
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Text>
        </Box>
        <Image src="/api/img/genteng.jpeg" alt='' w={"100%"} />
        <Text py={20} fz={"sm"} ta={"justify"}>
          Desa Darmasaba, yang terletak di Kecamatan Abiansemal, Kabupaten Badung, memiliki potensi besar dalam industri genteng yang dikelola oleh Usaha Mikro, Kecil, dan Menengah (UMKM). Sebagai desa yang masih mempertahankan nilai-nilai tradisional dalam pembangunan, industri genteng di Darmasaba berperan penting dalam penyediaan bahan bangunan berkualitas bagi masyarakat lokal maupun luar daerah.
        </Text>
        <Text fz={"sm"} ta={"justify"}>
          Potensi dan Peran UMKM Genteng:
        </Text>
        <List py={20} type='ordered'>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Genteng Tradisional Berkualitas Tinggi</Text>
            <Text fz={"sm"} ta={"justify"}>UMKM di Darmasaba memproduksi genteng dari bahan baku pilihan seperti tanah liat berkualitas, yang menghasilkan genteng dengan daya tahan tinggi, kuat, dan cocok untuk iklim tropis. Beberapa jenis genteng yang dihasilkan meliputi:</Text>
            <Text fz={"sm"} ta={"justify"}> - Genteng Tanah Liat : Kuat, tahan lama, dan memiliki estetika khas tradisional.</Text>
            <Text fz={"sm"} ta={"justify"}> - Genteng Beton : Cocok untuk bangunan modern dengan ketahanan lebih tinggi.</Text>
            <Text fz={"sm"} ta={"justify"}> - Genteng Keramik : Memberikan tampilan elegan dan daya serap air yang lebih rendah.</Text>
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Peluang Ekonomi dan Pemberdayaan Masyarakat:</Text>Industri genteng di Darmasaba memberikan peluang kerja bagi masyarakat setempat, terutama dalam bidang produksi, distribusi, hingga pemasaran. UMKM genteng juga mendukung keberlanjutan ekonomi desa dengan meningkatkan pendapatan warga serta mengurangi angka pengangguran.
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Inovasi dan Pengembangan Teknologi</Text>
            <Text fz={"sm"} ta={"justify"}>Beberapa pengrajin genteng di Darmasaba telah mulai mengadopsi teknologi modern dalam proses produksi, seperti:</Text>
            <Text fz={"sm"} ta={"justify"}> - Penggunaan cetakan dan oven pembakaran efisien untuk meningkatkan kualitas dan kapasitas produksi.</Text>
            <Text fz={"sm"} ta={"justify"}> - Teknik pelapisan anti bocor dan anti lumut untuk membuat genteng lebih tahan lama.</Text>
            <Text fz={"sm"} ta={"justify"}> - Desain genteng inovatif yang lebih ringan dan mudah dipasang.</Text>
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Pemasaran dan Ekspansi Pasar</Text>
            <Text fz={"sm"} ta={"justify"}>Dengan meningkatnya pembangunan perumahan dan proyek konstruksi di Bali, permintaan akan genteng berkualitas terus bertambah. UMKM genteng Darmasaba dapat memperluas pasarnya dengan:</Text>
            <Text fz={"sm"} ta={"justify"}> - Menjalin kerja sama dengan kontraktor dan pengembang properti.</Text>
            <Text fz={"sm"} ta={"justify"}> - Mempromosikan produk melalui media sosial dan marketplace online.</Text>
            <Text fz={"sm"} ta={"justify"}> - Menyediakan layanan custom sesuai kebutuhan pelanggan.</Text>
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Keberlanjutan dan Ramah Lingkungan:</Text>Industri genteng di Darmasaba berpotensi dikembangkan secara lebih ramah lingkungan dengan menerapkan metode produksi yang mengurangi limbah dan emisi. Pemanfaatan energi alternatif serta daur ulang bahan limbah dapat membantu menciptakan industri yang lebih berkelanjutan.
          </ListItem>
        </List>
        <Text fz={"sm"} ta={"justify"}>
          UMKM genteng di Desa Darmasaba memiliki potensi besar untuk terus berkembang sebagai sektor industri unggulan. Dengan inovasi, pemasaran yang lebih luas, serta dukungan dari pemerintah dan masyarakat, industri ini dapat meningkatkan kesejahteraan warga dan memperkuat perekonomian desa.
        </Text>
      </Container>
    </Stack>
  );
}

export default Page;
