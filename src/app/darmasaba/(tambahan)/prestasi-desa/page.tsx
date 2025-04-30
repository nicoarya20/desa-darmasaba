'use client'
import colors from '@/con/colors';
import { BackgroundImage, Box, Button, Container, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import BackButton from '../../(pages)/desa/layanan/_com/BackButto';
import { useRouter } from 'next/navigation';

const data = [
  {
    id: 1,
    title: "Olahraga dan Kepemudaan",
    description: "Tim Bola Voli Putri Dharma Temaja meraih juara 3 dalam Turnamen Bola Voli Mangupura Cup 2024 kategori Putri Se-Bali ",
    image: "/api/img/prestasi-voli.jpeg",
    link: "/darmasaba/prestasi-desa/tim-bola-voli-putri-dharma-temaja-meraih-juara-3-dalam-turnamen-bola-voli-mangupura-cup-2024-kategori-putri-se-bali"
  },
  {
    id: 2,
    title: "Hukum dan Kesadaran Masyarakat",
    description: "Prestasi Juara 3 dalam Lomba Keluarga Sadar Hukum Kabupaten Badung Tahun 2024",
    image: "/api/img/prestasilombahukum.png",
    link: "/darmasaba/prestasi-desa/prestasi-juara-3-dalam-lomba-keluarga-sadar-hukum-kabupaten-badung-tahun-2024"
  },
  {
    id: 3,
    title: "Tata Kelola dan Inovasi Desa",
    description: "Peringkat 5 Dalam Ajang Bergengsi Mangupura Award",
    image: "/api/img/prestasi-peringkat-5.jpeg",
    link: "/darmasaba/prestasi-desa/peringkat-5-dalam-ajang-bergengsi-mangupura-award"
  }
]
function Page() {
  const router = useRouter();
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"} >
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Container w={{ base: "100%", md: "50%" }}>
        <Text ta={"center"} fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
          Prestasi Desa
        </Text>
        <Text ta={"center"} py={10}>
          Temukan berbagai prestasi dan keunggulan yang dimiliki Desa Darmasaba.
        </Text>
      </Container>
      <SimpleGrid
        px={{ base: "md", md: 100 }}
        pb={20}
        cols={{
          base: 1,
          md: 3,
        }}
      >
        {data.map((v, k) => {
          return (
            <BackgroundImage
              key={k}
              src={v.image}
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
                <Group>
                  <Paper radius={"lg"} py={7} px={10}>
                    <Text>{v.title}</Text>
                  </Paper>
                </Group>
                <Box p={"lg"}>
                  <Text
                    fw={"bold"}
                    c={"white"}
                    size={"1.8rem"}
                    style={{
                      textAlign: "center",
                    }}>{v.description}</Text>
                </Box>
                <Group justify="center">
                  <Button px={20} radius={"100"} size="md" bg={colors["blue-button"]}
                    onClick={() => router.push(v.link)}>
                    Detail
                  </Button>
                </Group>
              </Stack>
            </BackgroundImage>
          )
        })}
      </SimpleGrid>
    </Stack>
  );
}

export default Page;
