import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Stack, Container, Box, Text, Image, ActionIcon, Divider, Flex } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandWhatsapp } from '@tabler/icons-react';
import React from 'react';


function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"} px={{ base: "md", md: 0 }}>
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Container w={{ base: "100%", md: "50%" }} >
        <Box pb={20}>
          <Text ta={"center"} fz={{ base: "2rem", md: "2.5rem", lg: "3rem", xl: "3.4rem" }} c={colors["blue-button"]} fw={"bold"}>
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
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Text py={20} fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Dengan bangga, KADARKUM Desa Darmasaba berhasil meraih Juara 3 dalam Lomba Keluarga Sadar Hukum Kabupaten Badung Tahun 2024.
          Prestasi ini tidak lepas dari dukungan penuh dan semangat tinggi dari Ida Bagus Surya Prabhawa Manuaba, S.H., M.H., NL.P. selaku Perbekel Darmasaba yang selalu mendampingi dari proses pelatihan hingga perlombaan, serta turut hadir perwakilan Kecamatan Abiansemal, Ketua BPD Desa Darmasaba, Ketua TP PKK Desa Darmasaba, Perangkat & Staf Desa Darmasaba, Karang Taruna Paramartha Dharma Desa Darmasaba dan seluruh Tim Sukses KADARKUM Desa Darmasaba.
        </Text>
        <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Acara yang berlangsung pada 14 November 2024 di Kertha Gosana Lt. 3 Pusat Pemerintahan Kabupaten Badung ini menjadi bukti nyata bahwa kerja keras dan kolaborasi adalah kunci keberhasilan.
        </Text>
        <Text py={20} fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Bersama, kita terus wujudkan Desa Darmasaba yang sadar hukum dan berprestasi!
        </Text>
        <Divider color={colors["blue-button"]} />
        <Flex justify={"space-between"} py={20}>
          <Text fz={'md'}>25 May 2021 . Darmasaba</Text>
          <Box>
            <Flex gap={"lg"}>
              <ActionIcon variant='transparent'>
                <IconBrandFacebook color={colors["blue-button"]} size={"30"} />
              </ActionIcon>
              <ActionIcon variant='transparent'>
                <IconBrandInstagram color={colors["blue-button"]} size={"30"} />
              </ActionIcon>
              <ActionIcon variant='transparent'>
                <IconBrandTwitter color={colors["blue-button"]} size={"30"} />
              </ActionIcon>
              <ActionIcon variant='transparent'>
                <IconBrandWhatsapp color={colors["blue-button"]} size={"30"} />
              </ActionIcon>
            </Flex>
          </Box>
        </Flex>
        <Divider color={colors["blue-button"]} pb={50} />
      </Box>
    </Stack>
  );
}

export default Page;
