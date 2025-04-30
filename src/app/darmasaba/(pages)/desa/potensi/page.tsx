'use client'
import colors from '@/con/colors';
import { BackgroundImage, Box, Button, Flex, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import BackButton from '../layanan/_com/BackButto';
import { useRouter } from 'next/navigation';

const datamap = [
  {
    id: 1,
    images: "/api/img/tps.png",
    name: "TPS3R Pudak Mesari",
    kategori: "Lingkungan",
    link: "/darmasaba/desa/potensi/tps3r-pudak-mesari",
  },
  {
    id: 2,
    images: "/api/img/ack.png",
    name: "Bumdes Pudak Mesari",
    kategori: "Ekonomi",
    link: "/darmasaba/desa/potensi/bumdes-pudak-mesari",
  },
  {
    id: 3,
    images: "/api/img/taman-beji.jpg",
    name: "Taman Beji Cengana",
    kategori: "Wisata",
    link: "/darmasaba/desa/potensi/taman-beji-cengana",
  },
  {
    id: 4,
    images: "/api/img/waterpark.png",
    name: "Gumuh Sari Water Park",
    kategori: "Wisata",
    link: "/darmasaba/desa/potensi/gumuh-sari-water-park",
  },
  {
    id: 5,
    images: "/api/img/pertanian.jpg",
    name: "Pertanian",
    kategori: "Ekonomi",
    link: "/darmasaba/desa/potensi/pertanian"
  },
  {
    id: 6,
    images: "/api/img/warungumkm.jpg",
    name: "Kawasan Kuliner",
    kategori: "Ekonomi",
    link: "/darmasaba/desa/potensi/kawasan-kuliner"
  },
  {
    id: 7,
    images: "/api/img/ikm.png",
    name: "IKM Berbasis Pengolahan Pangan",
    kategori: "Ekonomi",
    link: "/darmasaba/desa/potensi/ikm-berbasis-pengolahan-pangan"
  },
  {
    id: 8,
    images: "/api/img/genteng.jpeg",
    name: "Genteng",
    kategori: "Ekonomi",
    link: "/darmasaba/desa/potensi/genteng"
  },
  {
    id: 9,
    images: "/api/img/peternakanlele.jpg",
    name: "Peternakan Ikan Lele",
    kategori: "Ekonomi",
    link: "/darmasaba/desa/potensi/peternakan-ikan-lele"
  },
  {
    id: 10,
    images: "/api/img/jogging.jpg",
    name: "Jogging Track Tegeh Aban, Karang Gadon dan Munduk Uma Desa",
    kategori: "Lingkungan",
    link: "/darmasaba/desa/potensi/jogging-track-tegeh-aban-karang-gadon-dan-munduk-uma-desa"
  },
  {
    id: 11,
    images: "/api/img/damtanahputih.jpeg",
    name: "Dam Tanah Putih",
    kategori: "Wisata",
    link: "/darmasaba/desa/potensi/dam-tanah-putih"
  },
  {
    id: 12,
    images: "/api/img/umkm.jpeg",
    name: "UMKM",
    kategori: "Ekonomi",
    link: "/darmasaba/desa/potensi/umkm"
  },
  {
    id: 13,
    images: "/api/img/potong-daging.png",
    name: "Pemotongan Daging",
    kategori: "Ekonomi",
    link: "/darmasaba/desa/potensi/pemotongan-daging"
  },

]
function Page() {
  const router = useRouter()
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"} >
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Box>
          <Stack gap={0}>
            <Flex justify={"space-between"} align={"center"} >
              <Box>
                <Text fz={"3.4rem"} c={colors["blue-button"]} fw={"bold"}>
                  Potensi Desa
                </Text>
                <Text ta={"justify"} >
                  Temukan berbagai potensi dan keunggulan yang dimiliki Desa Darmasaba.
                </Text>
              </Box>
              <Paper radius={"md"} px={"xl"} py={5} bg={colors["blue-button"]} >
                <Flex justify={"space-evenly"} align={"center"} gap={"xl"}>
                  <Box>
                    <Text ta={"center"} fz={"h2"} fw={"bold"} c={"white"}>13</Text>
                    <Text ta={"center"} fz={"sm"} c={"white"}>Potensi</Text>
                  </Box>
                  <Box>
                    <Text ta={"center"} fz={"h2"} fw={"bold"} c={"white"}>5</Text>
                    <Text ta={"center"} fz={"sm"} c={"white"}>Destinasi Wisata</Text>
                  </Box>
                </Flex>
              </Paper>
            </Flex>
          </Stack>
        </Box>

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
                  <Group>
                    <Paper radius={"lg"} py={7} px={10}>
                      <Text>{v.kategori}</Text>
                    </Paper>
                  </Group>
                  <Box p={"lg"}>
                    <Text
                      fw={"bold"}
                      c={"white"}
                      size={"1.8rem"}
                      style={{
                        textAlign: "center",
                      }}>{v.name}</Text>
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
      </Box>

    </Stack>
  );
}

export default Page;
