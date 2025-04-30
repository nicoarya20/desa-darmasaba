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
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Text py={20} fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Selamat kepada Tim Bola Voli Putri Dharma Temaja yang berhasil meraih juara 3 dalam Turnamen Bola Voli Mangupura Cup 2024 kategori Putri Se-Bali.
          Perjuangan luar biasa yang ditunjukkan oleh tim ini merupakan bukti nyata kerja keras, kekompakan, dan semangat pantang menyerah. Dalam kompetisi yang diikuti oleh tim-tim terbaik dari seluruh Bali, Tim Dharma Temaja berhasil menunjukkan performa yang menginspirasi dan mengharumkan nama desa.
        </Text>
        <Text fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Terima kasih kepada seluruh pemain, pelatih, serta pendukung yang selalu memberikan dukungan penuh di setiap pertandingan. Kemenangan ini adalah awal dari perjalanan yang lebih besar, dan semoga prestasi ini dapat terus memotivasi kita untuk mencapai hasil yang lebih gemilang di masa depan.
        </Text>
        <Text py={20} fz={{ base: "sm", md: "lg" }} ta={"justify"}>
          Mari kita terus dukung Tim Bola Voli Putri Dharma Temaja agar semakin bersinar di ajang-ajang berikutnya
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
