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
            Pemotongan Daging
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
            fz={"h2"}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Text>
        </Box>
        <Image src="/api/img/potong-daging.png" alt='' w={"100%"} />
        <Text py={20} fz={{base: "sm", md:"lg"}} ta={"justify"}>
          Desa Darmasaba, yang terletak di Kecamatan Abiansemal, Kabupaten Badung, memiliki potensi besar dalam sektor pemotongan daging. Kegiatan ini tidak hanya berperan dalam memenuhi kebutuhan konsumsi lokal, tetapi juga mendukung sektor kuliner, usaha mikro, dan distribusi daging ke berbagai wilayah di Bali.
        </Text>
        <Text fz={{base: "sm", md:"lg"}} ta={"justify"}>
          Potensi dan Peran Pemotongan Daging:
        </Text>
        <List py={20} type='ordered'>
          <ListItem fz={{base: "sm", md:"lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md:"lg"}} fw={"bold"}>Pemotongan Daging sebagai Sumber Ekonomi</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}>Usaha pemotongan daging di Darmasaba menjadi salah satu sektor ekonomi yang berkembang pesat, terutama untuk memenuhi permintaan dari:</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - Warung makan dan rumah tangga : Daging segar untuk kebutuhan harian masyarakat.</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - Restoran dan usaha kuliner : Banyak digunakan dalam masakan khas Bali, seperti babi guling, sate lilit, dan lawar.</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - Pasar tradisional dan distributor daging : Suplai daging ke pasar di wilayah sekitar.</Text>
          </ListItem>
          <ListItem fz={{base: "sm", md:"lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md:"lg"}} fw={"bold"}>Jenis Daging yang Diproduksi</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}>Kuliner khas desa ini memiliki potensi besar untuk dikembangkan sebagai bisnis UMKM, seperti:</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - Daging babi : Salah satu produk utama yang digunakan untuk kuliner khas Bali seperti babi guling.</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - Daging sapi : Untuk kebutuhan rumah tangga, usaha kuliner, hingga upacara adat.</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - Daging ayam : Bahan dasar berbagai makanan seperti ayam betutu dan sate lilit.</Text>
          </ListItem>
          <ListItem fz={{base: "sm", md:"lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md:"lg"}} fw={"bold"}>Potensi Distribusi dan Pasar yang Luas</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}>Pemotongan daging di Darmasaba tidak hanya memenuhi kebutuhan desa, tetapi juga didistribusikan ke berbagai daerah di Bali, termasuk:</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - Pasar tradisional di Badung dan Denpasar.</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - Rumah makan, katering, dan warung lokal.</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - UMKM yang bergerak di bidang pengolahan daging seperti abon, bakso, dan dendeng.</Text>
          </ListItem>
          <ListItem fz={{base: "sm", md:"lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md:"lg"}} fw={"bold"}>Peluang Pengolahan dan Inovasi Produk</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}>Untuk meningkatkan nilai jual, usaha pemotongan daging di Darmasaba dapat dikembangkan dengan inovasi pengolahan seperti:</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - Daging olahan siap masak : Seperti sosis, bakso, dan abon yang lebih praktis untuk konsumen.</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - Produk daging asap atau dendeng : Memiliki daya tahan lebih lama dan nilai jual lebih tinggi.</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - Paket daging beku : Mempermudah distribusi ke restoran dan pelanggan yang membutuhkan penyimpanan lebih lama.</Text>
          </ListItem>
          <ListItem fz={{base: "sm", md:"lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md:"lg"}} fw={"bold"}>Dukungan dan Pengembangan Usaha</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}>Agar usaha pemotongan daging di Darmasaba semakin berkembang, diperlukan:</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - Peningkatan standar kebersihan dan keamanan pangan : Dengan penerapan Good Handling Practices (GHP).</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - Pemasaran digital dan kemitraan dengan UMKM : Untuk memperluas jangkauan pasar.</Text>
            <Text fz={{base: "sm", md:"lg"}} ta={"justify"}> - Pengolahan limbah yang ramah lingkungan : Agar tidak mencemari lingkungan sekitar.</Text>
          </ListItem>
        </List>
        <Text fz={{base: "sm", md:"lg"}} ta={"justify"}>
          Pemotongan daging di Desa Darmasaba memiliki potensi besar sebagai sektor ekonomi utama, dengan permintaan pasar yang tinggi serta peluang inovasi dalam pengolahan produk daging. Dengan pengelolaan yang baik, usaha ini dapat berkembang menjadi industri yang lebih modern, higienis, dan berkelanjutan.
        </Text>
      </Container>
    </Stack>
  );
}

export default Page;
