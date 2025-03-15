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
            Peternakan Ikan Lele
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
          >
            Informasi dan Pelayanan Administrasi Digital
          </Text>
        </Box>
        <Image src="/api/img/peternakanlele.jpg" alt='' w={"100%"} />
        <Text py={20} fz={"sm"} ta={"justify"}>
        Desa Darmasaba, yang terletak di Kecamatan Abiansemal, Kabupaten Badung, memiliki potensi besar dalam sektor peternakan lele. Dengan kondisi lingkungan yang mendukung serta meningkatnya permintaan ikan lele di pasaran, budidaya ikan lele dapat menjadi salah satu sektor ekonomi unggulan yang mampu meningkatkan kesejahteraan masyarakat desa.
        </Text>
        <Text fz={"sm"} ta={"justify"}>
          Potensi dan Peran Peternakan Ikan Lele:
        </Text>
        <List py={20} type='ordered'>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Kondisi Lingkungan yang Mendukung</Text>
            <Text fz={"sm"} ta={"justify"}>Darmasaba memiliki sumber air yang cukup serta iklim yang cocok untuk budidaya ikan lele. Kolam-kolam budidaya dapat dibuat dengan berbagai sistem, seperti:</Text>
            <Text fz={"sm"} ta={"justify"}> - Kolam Terpal : Mudah dibuat dan lebih efisien dalam perawatan.</Text>
            <Text fz={"sm"} ta={"justify"}> - Kolam Beton : Lebih tahan lama dan cocok untuk produksi skala besar.</Text>
            <Text fz={"sm"} ta={"justify"}> - Sistem Bioflok : Teknologi modern yang dapat meningkatkan kepadatan ikan dan mengurangi limbah.</Text>
          </ListItem>
          <ListItem fz={"sm"} ta={"justify"}>
            <Text fz={"sm"} fw={"bold"}>Permintaan Pasar yang Tinggi:</Text>Lele merupakan salah satu jenis ikan yang memiliki permintaan tinggi di Bali, baik untuk konsumsi rumah tangga, warung makan, hingga restoran. Produk olahan seperti lele goreng, pecel lele, dan abon lele semakin diminati, membuka peluang besar bagi peternak lele di Darmasaba.
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
