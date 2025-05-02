import colors from "@/con/colors";
import { BackgroundImage, Box, Button, Center, Container, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import Link from "next/link";

const data = [
    {
        id: 1,
        title: "Olahraga dan Kepemudaan",
        deskripsi: "Tim Bola Voli Putri Dharma Temaja meraih juara 3 dalam Turnamen Bola Voli Mangupura Cup 2024 kategori Putri Se-Bali ",
        image: "/api/img/prestasi-voli.jpeg",
        link: "/darmasaba/prestasi-desa/tim-bola-voli-putri-dharma-temaja-meraih-juara-3-dalam-turnamen-bola-voli-mangupura-cup-2024-kategori-putri-se-bali"
      },
      {
        id: 2,
        title: "Hukum dan Kesadaran Masyarakat",
        deskripsi: "Prestasi Juara 3 dalam Lomba Keluarga Sadar Hukum Kabupaten Badung Tahun 2024",
        image: "/api/img/prestasilombahukum.png",
        link: "/darmasaba/prestasi-desa/prestasi-juara-3-dalam-lomba-keluarga-sadar-hukum-kabupaten-badung-tahun-2024"
      },
      {
        id: 3,
        title: "Tata Kelola dan Inovasi Desa",
        deskripsi: "Peringkat 5 Dalam Ajang Bergengsi Mangupura Award",
        image: "/api/img/prestasi-peringkat-5.jpeg",
        link: "/darmasaba/prestasi-desa/peringkat-5-dalam-ajang-bergengsi-mangupura-award"
      }
]
function Prestasi() {
    return (
        <>
            <Stack p={"sm"}>
                <Container w={{ base: "100%", md: "80%" }} p={"xl"}>
                    <Text ta={"center"} fz={"3.4rem"}>Prestasi Desa</Text>
                    <Text fz={"1.4rem"} ta={"center"}>Kami bangga dengan apa yang telah dicapai desa kita hingga saat ini. Semoga prestasi ini menjadi inspirasi untuk terus berkarya dan berinovasi demi kemajuan bersama.</Text>
                    <Center pt={20}>
                        <Button radius={"lg"} fz={"h4"} color={colors["blue-button"]} component={Link} href="/darmasaba/prestasi-desa">Selengkapnya</Button>
                    </Center>
                </Container>
                <Box py={50}>
                    <SimpleGrid
                        cols={{
                            base: 1,
                            sm: 3
                        }}
                    >
                        {data.map((v, k) => {
                            return (
                                <BackgroundImage
                                    key={k}
                                    src={v.image}
                                    h={720}
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
                                    <Stack justify="space-between" h={"100%"} gap={0} p={"lg"} pos={"relative"}>
                                        <Box p={"lg"}>
                                            <Text
                                                c={"white"}
                                                fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem"}}
                                                ta={"center"}
                                            >
                                                {v.title}
                                            </Text>
                                        </Box>
                                        <Text
                                            fw={"bold"}
                                            c={"white"}
                                            fz={{base: "2rem", md: "2.5rem", lg: "2.7rem", xl: "3rem"}}
                                            ta={"center"}
                                        >
                                            {v.deskripsi}
                                        </Text>
                                        <Group justify="center">
                                            <Button component={Link} href={v.link} px={46} radius={"100"} size="md" bg={colors["blue-button"]}>
                                                Lihat Detail
                                            </Button>
                                        </Group>
                                    </Stack>
                                </BackgroundImage>
                            )
                        })}
                    </SimpleGrid>
                </Box>
            </Stack>
        </>
    )
}
export default Prestasi;