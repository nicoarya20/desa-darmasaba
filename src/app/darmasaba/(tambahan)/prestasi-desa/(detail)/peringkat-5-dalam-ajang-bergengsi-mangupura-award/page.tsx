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
          <Text ta={"center"} fz={{base: "2rem", md: "2.5rem", lg: "3rem", xl: "3.4rem"}} c={colors["blue-button"]} fw={"bold"}>
            Peringkat 5 Dalam Ajang Bergengsi Mangupura Award
          </Text>
          <Text
            ta={"center"}
            fw={"bold"}
            fz={"1.5rem"}
          >
            Tata Kelola dan Inovasi Desa
          </Text>
        </Box>
        <Image src="/api/img/prestasi-peringkat-5.jpeg" alt='' w={"100%"} />
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Text py={20} fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Pada hari Senin, 18 November 2024, Desa Darmasaba kembali mencetak prestasi gemilang dengan meraih peringkat V dalam ajang bergengsi Mangupura Award. Penganugerahan ini berlangsung dalam rangkaian acara HUT Kota Mangupura ke-15 yang dihadiri oleh Drs. I Ketut Suiasa, S.H., Plt Bupati Badung, serta para tokoh penting lainnya.
        </Text>
        <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Penghargaan ini bukan hanya sebuah pengakuan, tetapi juga menjadi motivasi bagi Desa Darmasaba untuk terus meningkatkan inovasi, pelayanan, pembangunan serta transformasi digital.
          Mari bersama kita lanjutkan semangat kolaborasi dan inovasi untuk menjadikan Darmasaba sebagai desa yang semakin unggul dan inspiratif!
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
