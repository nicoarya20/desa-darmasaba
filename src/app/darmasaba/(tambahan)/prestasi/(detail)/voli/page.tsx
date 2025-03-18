import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Stack, Container, Box, Text, Image } from '@mantine/core';
import React from 'react';
function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"42"} px={{base: "md", md: 0}}>
      <Container w={{ base: "100%", md: "50%" }} >
        <BackButton />
        <Box pb={20}>
          <Text ta={"center"} fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
            Juara 3 Turnamen Bola Voli Mangupura Cup 2024
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
            fz={"1.5rem"}
          >
            Olahraga dan Kepemudaan
          </Text>
        </Box>
        <Image src="/api/img/prestasi-voli.jpeg" alt='' w={"100%"} />
        <Text py={20} fz={{base: "sm", md: "lg"}} ta={"justify"}>
        Selamat kepada Tim Bola Voli Putri Dharma Temaja yang berhasil meraih juara 3 dalam Turnamen Bola Voli Mangupura Cup 2024 kategori Putri Se-Bali.
        </Text>
        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>
        Perjuangan luar biasa yang ditunjukkan oleh tim ini merupakan bukti nyata kerja keras, kekompakan, dan semangat pantang menyerah. Dalam kompetisi yang diikuti oleh tim-tim terbaik dari seluruh Bali, Tim Dharma Temaja berhasil menunjukkan performa yang menginspirasi dan mengharumkan nama desa.
        </Text>
        <Text py={20} fz={{base: "sm", md: "lg"}} ta={"justify"}>
        Terima kasih kepada seluruh pemain, pelatih, serta pendukung yang selalu memberikan dukungan penuh di setiap pertandingan. Kemenangan ini adalah awal dari perjalanan yang lebih besar, dan semoga prestasi ini dapat terus memotivasi kita untuk mencapai hasil yang lebih gemilang di masa depan. 
        </Text>
        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>
        Mari kita terus dukung Tim Bola Voli Putri Dharma Temaja agar semakin bersinar di ajang-ajang berikutnya
        </Text>
      </Container>
    </Stack>
  );
}

export default Page;
