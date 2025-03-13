'use client'
import colors from '@/con/colors';
import { BackgroundImage, Box, Button, Container, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import React from 'react';
import BackButton from '../layanan/_com/BackButto';
// import { useRouter } from 'next/navigation';

const datamap = [
  {
    id: 1,
    images: "/api/img/tps.png",
    name: "TPS3R Pudak Mesari",
    deskripsi: "TPS 3R Pudak Mesari Darmasaba layak mendapat penghargaan demikian apresiasi dari Delterra Sosial Indonesia nie Semeton Darmasaba!, Hal tersebut dikarenakan walaupun baru berdiri namun TPS 3R kebanggaan Desa Darmasaba tersebut sudah berjalan dengan sangat baik. "
  },
  {
    id: 2,
    images: "/api/img/ack.png",
    name: "Bumdes Pudak Mesari",
    deskripsi: "Bumdes Pudak Mesari sangat membantu warga desa Darmasaba dalam mengelola dan membangun sebuah desa yang lebih baik lagi"
  },
  {
    id: 3,
    images: "/api/img/taman-beji.jpg",
    name: "Taman Beji Cengana",
    deskripsi: "Tirta Klebutan di Pura Taman Beji Cengana di Desa Adat Darmasaba, Badung, selain dipercaya nunas Taksu serta pembersihan diri. Tersemat juga asal usul cerita ditemukannya Tirta Klebutan yang tepat berada di pinggir Tukad Cengana tersebut."
  },
  {
    id: 4,
    images: "/api/img/waterpark.png",
    name: "Gumuh Sari Water Park",
    deskripsi: "Gumuh Sari Rekreasi atau waterpark, tempat wisata yang asyik dan seru untuk kamu sekeluarga! Tempat liburan di Bali memang seakan nggak ada habisnya. Selalu ada aja destinasi wisata seru yang bisa jadi wishlist. Ada banyak banget tempat wisata yang kamu kunjungi di Bali, mulai dari wisata alam, wisata modern, sampai wisata air."
  },
  {
    id: 5,
    images: "/api/img/pertanian.jpg",
    name: "Pertanian",
    deskripsi: "Dalam rangka pelaksanaan program ketahanan pangan tingkat desa, Pemerintah Desa Darmasaba telah membentuk kelompok petani dan peternak. Kelompok petani selanjutnya menggarap lahan yang sudah disiapkan untuk menanam tanaman pangan seperti cabe, tomat, timun, dan lain-lainnya sedangkan kelompok peternak akan melakukan ternak ikan lele."
  },
]
function Page() {
  // const router = useRouter()
  return (
    <Stack pos={"relative"} bg={colors.grey[1]} py={"xl"} gap={"42"}>
      <Container w={{ base: "100%", md: "50%" }}>
        <BackButton />
        <Stack align='center' gap={0}>
          <Text fz={"3.4rem"} fw={"bold"}>
            Potensi Desa
          </Text>
          <Text ta={"justify"} py={10}>
            Potensi desa adalah segenap sumber daya alam dan sumber daya manusia yang dimiliki desa sebagai modal dasar yang perlu dikelola dan dikembangkan bagi kelangsungan dan perkembangan desa.
          </Text>
        </Stack>
        <Text ta={"justify"}>
          Adapun potensi yang dimiliki Desa Darmasaba yaitu:
        </Text>
      </Container>
      <Box px={"lg"}>

      <SimpleGrid
          py={20}
          cols={{
            base: 1,
            sm: 3
          }}
        >
          {datamap.map((v, k) => {
            return (
              <BackgroundImage
                key={k}
                src={v.images}
                h={350}
                radius={16}
                pos={"relative"}
              >
                <Box
                  style={{
                    borderRadius: 16,
                    zIndex: 0
                  }}
                  pos={"absolute"}
                  w={"100%"}
                  h={"100%"}
                  bg={colors.trans.dark[2]}
                />
                <Stack justify='space-between' h={"100%"} gap={0} p={"lg"} pos={"relative"}>
                  <Box p={"lg"}>
                    <Text
                      c={"white"}
                      size={"1.5rem"}
                      style={{
                        textAlign: "center",
                      }}>{v.name}</Text>
                  </Box>
                  <Group justify="center">
                    <Button px={20} radius={"100"} size="md" bg={colors["blue-button"]}
                      >
                      Detail
                    </Button>
                  </Group>
                </Stack>
              </BackgroundImage>
            )
          })}
        </SimpleGrid>
      </Box>

    </Stack>
  );
}

export default Page;
