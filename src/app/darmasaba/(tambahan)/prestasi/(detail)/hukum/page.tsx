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
            Juara 3 dalam Lomba Keluarga Sadar Hukum Kabupaten Badung Tahun 2024
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
            fz={"1.5rem"}
          >
            Hukum dan Kesadaran Masyarakat
          </Text>
        </Box>
        <Image src="/api/img/prestasilombahukum.png" alt='' w={"100%"} />
        <Text py={20} fz={{base: "sm", md: "lg"}} ta={"justify"}>
        Dengan bangga, KADARKUM Desa Darmasaba berhasil meraih Juara 3 dalam Lomba Keluarga Sadar Hukum Kabupaten Badung Tahun 2024.
        </Text>
        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>
        Prestasi ini tidak lepas dari dukungan penuh dan semangat tinggi dari Ida Bagus Surya Prabhawa Manuaba, S.H., M.H., NL.P. selaku Perbekel Darmasaba yang selalu mendampingi dari proses pelatihan hingga perlombaan, serta turut hadir perwakilan Kecamatan Abiansemal, Ketua BPD Desa Darmasaba, Ketua TP PKK Desa Darmasaba, Perangkat & Staf Desa Darmasaba, Karang Taruna Paramartha Dharma Desa Darmasaba dan seluruh Tim Sukses KADARKUM Desa Darmasaba.
        </Text>
        <Text py={20} fz={{base: "sm", md: "lg"}} ta={"justify"}>
        Acara yang berlangsung pada 14 November 2024 di Kertha Gosana Lt. 3 Pusat Pemerintahan Kabupaten Badung ini menjadi bukti nyata bahwa kerja keras dan kolaborasi adalah kunci keberhasilan.
        </Text>
        <Text fz={{base: "sm", md: "lg"}} ta={"justify"}>
        Bersama, kita terus wujudkan Desa Darmasaba yang sadar hukum dan berprestasi!


        </Text>
      </Container>
    </Stack>
  );
}

export default Page;
