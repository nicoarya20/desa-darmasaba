import colors from "@/con/colors";
import { BackgroundImage, Box, Button, Center, Container, Group, SimpleGrid, Stack, Text } from "@mantine/core";

const data = [
    {
        id: 1,
        title: "Tata Kelola Pemerintahan",
        image: "/api/img/lombadesa.jpg",
        deskripsi: "Juara 1 Lomba Desa Tingkat Kabupaten/Kota Tahun [XXXX]"
    },
    {
        id: 2,
        title: "Tata Kelola Pemerintahan",
        image: "/api/img/lombadesa.jpg",
        deskripsi: "Juara 1 Lomba Desa Tingkat Kabupaten/Kota Tahun [XXXX]"
    },
    {
        id: 3,
        title: "Tata Kelola Pemerintahan",
        image: "/api/img/lombadesa.jpg",
        deskripsi: "Juara 1 Lomba Desa Tingkat Kabupaten/Kota Tahun [XXXX]"
    },
]
function Prestasi() {
    return (
        <>
            <Stack p={"sm"}>
                <Container w={{ base: "100%", md: "80%" }} p={"xl"}>
                    <Center>
                        <Text fz={"3.4rem"}>Prestasi Desa</Text>
                    </Center>
                    <Text fz={"1.4rem"} ta={"center"}>Kami bangga dengan apa yang telah dicapai desa kita hingga saat ini. Semoga prestasi ini menjadi inspirasi untuk terus berkarya dan berinovasi demi kemajuan bersama.</Text>
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
                                                size={"1.5rem"}
                                                ta={"center"}
                                            >
                                                {v.title}
                                            </Text>
                                        </Box>
                                        <Text
                                            fw={"bold"}
                                            c={"white"}
                                            size={"3.5rem"}
                                            ta={"center"}
                                        >
                                            {v.deskripsi}
                                        </Text>
                                        <Group justify="center">
                                            <Button px={46} radius={"100"} size="md" bg={colors["blue-button"]}>
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