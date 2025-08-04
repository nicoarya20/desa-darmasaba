/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import prestasiState from "@/app/admin/(dashboard)/_state/landing-page/prestasi-desa";
import colors from "@/con/colors";
import { BackgroundImage, Box, Button, Center, Container, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { useProxy } from "valtio/utils";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function Prestasi() {
    const state = useProxy(prestasiState.prestasiDesa);
    const [loading, setLoading] = useState(false);
    const router = useRouter()

    useEffect(() => {
        prestasiState.kategoriPrestasi.findMany.load()
        const loadData = async () => {
            try {
                setLoading(true);
                await state.findMany.load();
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [])

    const data = (state.findMany.data || []).slice(0, 3);
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
                        {loading ? (
                            <Center>
                                <Text fz={"2.4rem"}>Memuat Data...</Text>
                            </Center>
                        ) : (
                            data.map((v, k) => {
                                return (
                                    <BackgroundImage
                                        key={k}
                                        src={v.image?.link || ''}
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
                                                    fz={{ base: "1rem", md: "1.125rem", lg: "1.25rem", xl: "1.5rem" }}
                                                    ta={"center"}
                                                >
                                                    {v.kategori.name}
                                                </Text>
                                            </Box>
                                            <Text
                                                fw={"bold"}
                                                c={"white"}
                                                fz={{ base: "2rem", md: "2.5rem", lg: "2.7rem", xl: "3rem" }}
                                                ta={"center"}
                                                dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                                            />
                                            <Group justify="center">
                                                <Button onClick={() => router.push(`/darmasaba/prestasi-desa/${v.id}`)} px={46} radius={"100"} size="md" bg={colors["blue-button"]}>
                                                    Lihat Detail
                                                </Button>
                                            </Group>
                                        </Stack>
                                    </BackgroundImage>
                                )
                            })
                        )}
                    </SimpleGrid>
                </Box>
            </Stack>
        </>
    )
}
export default Prestasi;