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
            Gumuh Sari Waterpark
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Text>
        </Box>
        <Image src="/api/img/waterpark.png" alt='' w={"100%"} h={400} />
        <Text py={20} fz={"sm"} ta={"justify"}>
          Gumuh Sari Waterpark, terletak di Jl. Tegal Gumuh No. 9, Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung, Bali, adalah destinasi rekreasi yang menawarkan berbagai fasilitas untuk pengunjung dari segala usia. Taman rekreasi ini tidak hanya menyediakan wahana air yang menyenangkan, tetapi juga fasilitas olahraga dan kuliner, menjadikannya tempat ideal untuk rekreasi keluarga dan komunitas.
        </Text>
        <Text fz={"sm"} ta={"justify"}>
          Potensi Desa melalui Gumuh Sari Waterpark:
        </Text>
        <List py={20} type='ordered'>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Pengembangan Pariwisata Lokal:</Text> Dengan adanya destinasi seperti Gumuh Sari Waterpark, Desa Darmasaba dapat menarik lebih banyak wisatawan lokal maupun mancanegara. Kehadiran pengunjung ini berpotensi meningkatkan pendapatan desa dan membuka peluang usaha baru bagi masyarakat setempat.
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Peningkatan Ekonomi Masyarakat:</Text>Fasilitas seperti restoran dan pusat olahraga di dalam kompleks waterpark memberikan peluang bagi warga lokal untuk terlibat dalam sektor jasa dan perdagangan. Hal ini dapat menciptakan lapangan pekerjaan dan mendukung pertumbuhan ekonomi desa.
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Pengembangan Fasilitas Olahraga dan Kesehatan:</Text>Dengan adanya pusat futsal dan gym, Gumuh Sari Waterpark mendorong masyarakat untuk berpartisipasi dalam kegiatan olahraga, yang dapat meningkatkan kesehatan dan kesejahteraan warga.
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Pemberdayaan Komunitas Melalui Event dan Acara:</Text>Waterpark ini sering menjadi tuan rumah berbagai acara komunitas, seperti pesta busa dan bola, yang dapat mempererat hubungan antarwarga dan menciptakan lingkungan yang harmonis.
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Peningkatan Infrastruktur dan Aksesibilitas:</Text>Dengan meningkatnya jumlah pengunjung, infrastruktur desa seperti jalan, transportasi, dan layanan umum lainnya akan berkembang untuk memenuhi kebutuhan tersebut, yang pada gilirannya meningkatkan kualitas hidup masyarakat setempat.
          </ListItem>
        </List>
        <Text fz={"sm"} ta={"justify"}>
          Melalui pengelolaan dan pengembangan yang tepat, Gumuh Sari Waterpark dapat menjadi motor penggerak bagi kemajuan Desa Darmasaba, meningkatkan kesejahteraan masyarakat, dan menjadikan desa ini sebagai destinasi wisata yang dikenal luas.
        </Text>
      </Container>
    </Stack>
  );
}

export default Page;
