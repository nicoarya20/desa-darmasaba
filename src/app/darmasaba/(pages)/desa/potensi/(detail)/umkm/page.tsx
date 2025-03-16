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
          UMKM
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
            fz={"1.5rem"}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Text>
        </Box>
        <Image src="/api/img/umkm.jpeg" alt='' w={"100%"} />
        <Text py={20} fz={{base: "sm", md: "lg"}} ta={"justify"}>
        Desa Darmasaba, yang terletak di Kecamatan Abiansemal, Kabupaten Badung, memiliki potensi besar dalam sektor Usaha Mikro, Kecil, dan Menengah (UMKM). Keberadaan UMKM di desa ini tidak hanya menjadi motor penggerak ekonomi lokal, tetapi juga mendukung pelestarian budaya dan kearifan lokal melalui berbagai produk unggulan.
        </Text>
        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>
          Potensi dan Peran UMKM:
        </Text>
        <List py={20} type='ordered'>
          <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Kerajinan Tangan dan Produk Lokal</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>Darmasaba memiliki banyak pengrajin yang menghasilkan produk unik dengan nilai seni tinggi, seperti:</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Genteng dan bahan bangunan tradisional : Genteng khas Darmasaba yang berkualitas tinggi.</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Kerajinan anyaman dan ukiran : Produk berbasis rotan dan kayu yang banyak diminati pasar lokal dan internasional.</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Pakaian adat dan kain tradisional : Mendukung pelestarian budaya Bali.</Text>
          </ListItem>
          <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Industri Kuliner Khas Darmasaba</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>Kuliner khas desa ini memiliki potensi besar untuk dikembangkan sebagai bisnis UMKM, seperti:</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Babi Guling : Salah satu kuliner favorit yang banyak diminati wisatawan.</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Jajanan tradisional Bali : Seperti laklak, jaja uli, dan klepon yang masih dibuat dengan cara tradisional.</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Olahan ikan lele : Seperti abon lele, lele asap, dan pecel lele yang memiliki pasar luas.</Text>
          </ListItem>
          <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>UMKM Berbasis Pengolahan Pangan</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>Beberapa UMKM di Darmasaba mengolah hasil pertanian dan peternakan menjadi produk bernilai tambah, seperti:</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Keripik singkong dan pisang : Camilan sehat berbasis bahan lokal.</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Olahan kelapa : Seperti minyak kelapa murni dan gula aren.</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Produk herbal dan jamu : Menggunakan bahan-bahan alami dari tanaman lokal.</Text>
          </ListItem>
          <ListItem fz={{base: "sm", md: "lg"}} ta={"justify"}>
            <Text fz={{base: "sm", md: "lg"}} fw={"bold"}>Dukungan dan Pengembangan UMKM</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>Agar UMKM di Darmasaba semakin berkembang, perlu adanya:</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Pelatihan dan pendampingan usaha : Untuk meningkatkan kualitas produk dan manajemen usaha.</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Pemasaran digital : Menggunakan media sosial dan e-commerce untuk menjangkau pasar lebih luas.</Text>
            <Text fz={{base: "sm", md: "lg"}} ta={"justify"}> - Kerja sama dengan BUMDes Pudak Mesari : Untuk membantu akses modal dan pengelolaan bisnis yang lebih profesional.</Text>
          </ListItem>
        </List>
        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>
        UMKM di Desa Darmasaba memiliki potensi besar dalam berbagai sektor, mulai dari kerajinan tangan, kuliner, hingga wisata berbasis masyarakat. Dengan inovasi, pemasaran yang lebih luas, dan dukungan dari pemerintah desa serta masyarakat, UMKM Darmasaba dapat berkembang pesat dan menjadi tulang punggung perekonomian desa.
        </Text>
      </Container>
    </Stack>
  );
}

export default Page;
