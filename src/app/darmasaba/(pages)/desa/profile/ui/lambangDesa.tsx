import colors from '@/con/colors';
import { Box, Stack, Paper, Image, Text, Center } from '@mantine/core';
import React from 'react';

function LambangDesa() {
  return (
    <Box pb={70}>
      <Stack align='center' gap={0}>
        <Box pb={30}>
          <Center>
          <Image src={"/api/img/darmasaba-icon.png"} alt="" w={{ base: 200, md: 300 }} />
          </Center>
          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Lambang Desa</Text>
        </Box>
        <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
          <Text fz={{ base: "md", md: "h3"}} ta={"justify"}>
            Simbul atau lambang bukanlah suatu gambar bentuk tanpa mengandung makna, namun segala yang terdapat di dalamnya mengandung makna filosofi yang mendalam dan kepribadian, setidaknya mengandung suatu pengharapan atau tujuan yang ingin dicapai oleh yang empunya lambang tersebut.
          </Text>
          <Text fz={{ base: "md", md: "h3"}} py={10} ta={"justify"}>
            Lambang Desa Darmasaba berbentuk persegi lima sama sisi dengan dasar warna biru yang di dalamnya terdapat bangunan Padmasana dengan rong tiga, di dasarnya terdapat bunga Padma berwarna merah muda yang dikelilingi oleh padi dan kapas serta rantai sebagai pengikatnya, terdapat pula pita berwarna putih bertuliskan “Dharma Temaja”.
          </Text>
          <Box>
            <Text fz={{ base: "md", md: "h3"}} ta={"justify"} fw={"bold"}>
              Bentuk Dasar Persegi Lima
            </Text>
            <Text fz={{ base: "md", md: "h3"}} ta={"justify"}>
              Melambangkan Pancasila yang menjadi dasar Negara Republik Indonesia yang harus dihayati dan diamalkan oleh masyarakat Indonesia termasuk masyarakat Desa Darmaaba merupakan bagian dari Bangsa Indonesia.
            </Text>
          </Box>
          <Box>
            <Text fz={{ base: "md", md: "h3"}} ta={"justify"} fw={"bold"}>
            Dasar Persegi Lima Yang Berwarna Biru
            </Text>
            <Text fz={{ base: "md", md: "h3"}} ta={"justify"}>
            Mengandung makna wilayah Desa Darmasaba yang luas, tanahnya yg subur dan masyarakatnya memiliki berbagai macam mata pencaharian.
            </Text>
          </Box>
          <Box>
            <Text fz={{ base: "md", md: "h3"}} ta={"justify"} fw={"bold"}>
            Bangunan Pelinggih Padmasana Rong Tiga
            </Text>
            <Text fz={{ base: "md", md: "h3"}} ta={"justify"}>
            Merupakan perlambang wilayah Desa Darmasaba terdiri dari tiga Desa Adat antara lain Desa Adat Aban, Desa Adat Tegal dan Desa Adat Darmasaba yang dengan rasa persatuan dan kesatuan dilandasi semangat segalak segilik seguluk sebayantaka membangun Desa Darmasaba.
            </Text>
          </Box>
          <Box>
            <Text fz={{ base: "md", md: "h3"}} ta={"justify"} fw={"bold"}>
            Bunga Padma Merah Muda
            </Text>
            <Text fz={{ base: "md", md: "h3"}} ta={"justify"}>
              Memiliki arti kemuliaan.
            </Text>
          </Box>
        </Paper>

      </Stack>
    </Box >
  );
}

export default LambangDesa;
