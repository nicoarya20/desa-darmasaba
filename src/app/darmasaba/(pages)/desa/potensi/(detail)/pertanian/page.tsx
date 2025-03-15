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
            Pertanian
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Text>
        </Box>
        <Image src="/api/img/pertanian.jpg" alt='' w={"100%"} h={400} />
        <Text py={20} fz={"sm"} ta={"justify"}>
        Desa Darmasaba, yang terletak di Kecamatan Abiansemal, Kabupaten Badung, Bali, memiliki potensi pertanian yang besar sebagai bagian dari warisan agraris yang telah diwariskan secara turun-temurun. Dengan kondisi tanah yang subur serta sistem irigasi tradisional subak, pertanian di Darmasaba memainkan peran penting dalam ekonomi dan keberlanjutan lingkungan desa.
        </Text>
        <Text fz={"sm"} ta={"justify"}>
          Potensi Desa melalui Pertanian:
        </Text>
        <List py={20} type='ordered'>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Potensi dan Komoditas Unggulan</Text> 
            <Text fz={"sm"} ta={"justify"}>Pertanian di Desa Darmasaba mengandalkan berbagai jenis tanaman yang memiliki nilai ekonomi tinggi, di antaranya:</Text>
            <Text fz={"sm"} ta={"justify"}> - Padi : Sebagai salah satu desa yang masih mempertahankan sistem subak, Darmasaba menjadi bagian dari lumbung pangan di Bali.</Text>
            <Text fz={"sm"} ta={"justify"}> - Sayur-mayur : Beberapa jenis sayuran seperti kangkung, bayam, cabai, dan tomat banyak dibudidayakan oleh petani lokal.</Text>
            <Text fz={"sm"} ta={"justify"}> - Buah-buahan tropis : Termasuk pisang, mangga, dan kelapa, yang menjadi sumber pendapatan tambahan bagi petani.</Text>
            <Text fz={"sm"} ta={"justify"}> - Tanaman obat dan rempah : Seperti jahe, kunyit, dan lengkuas, yang memiliki permintaan tinggi baik untuk kebutuhan rumah tangga maupun industri herbal.</Text>
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Sistem Irigasi Tradisional Subak:</Text>Sebagai bagian dari warisan budaya Bali, sistem irigasi subak masih diterapkan di Darmasaba. Sistem ini memungkinkan distribusi air yang adil di antara lahan pertanian dan membantu menjaga keberlanjutan produksi pangan desa.
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Pengembangan Pertanian Organik:</Text>Dengan meningkatnya kesadaran akan pentingnya produk sehat dan ramah lingkungan, beberapa petani di Darmasaba mulai beralih ke metode pertanian organik. Hal ini membuka peluang bagi desa untuk mengembangkan produk-produk pertanian yang memiliki nilai jual lebih tinggi.
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Agrowisata sebagai Sumber Pendapatan Baru:</Text>Potensi pertanian Darmasaba juga dapat dikembangkan menjadi agrowisata, di mana wisatawan dapat merasakan pengalaman langsung dalam bertani, mengikuti workshop bercocok tanam, serta menikmati hasil pertanian segar. Hal ini dapat menarik wisatawan lokal maupun mancanegara, meningkatkan perekonomian desa.
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Pemberdayaan Petani dan UMKM Berbasis Pertanian:</Text>Dengan adanya BUMDes Pudak Mesari dan dukungan dari pemerintah setempat, petani di Darmasaba dapat diberikan pelatihan dan akses pasar yang lebih luas. Produk pertanian dapat diolah menjadi berbagai produk turunan seperti keripik pisang, sambal khas desa, hingga minuman herbal yang dapat dipasarkan ke luar daerah.
          </ListItem>
        </List>
        <Text fz={"sm"} ta={"justify"}>
        Dengan berbagai potensi yang dimiliki, pertanian di Desa Darmasaba dapat terus berkembang melalui inovasi dan pemanfaatan teknologi pertanian modern. Dukungan dari masyarakat, pemerintah, dan lembaga terkait sangat penting untuk menjaga keberlanjutan sektor pertanian dan meningkatkan kesejahteraan petani di desa ini. 
        </Text>
      </Container>
    </Stack>
  );
}

export default Page;
