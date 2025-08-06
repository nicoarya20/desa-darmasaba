/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import penghargaanState from "@/app/admin/(dashboard)/_state/desa/penghargaan";
import colors from "@/con/colors";
import { Carousel, CarouselSlide } from "@mantine/carousel";
import { Box, Button, Container, Group, Paper, Stack, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Autoplay from "embla-carousel-autoplay";
import { useTransitionRouter } from "next-view-transitions";
import { useEffect, useRef } from "react";
import { useProxy } from "valtio/utils";
import BackButton from "../../(pages)/desa/layanan/_com/BackButto";

export default function Page() {
    return (
        <Stack pos={"relative"} bg={colors.grey[1]} py={"xl"} gap={22}>
            <Box px={{ base: "md", md: 100 }}>
                <BackButton />
            </Box>
            <Container w={{ base: "100%", md: "50%" }}>
                <Stack align="center" gap={0}>
                    <Text fz={"3.4rem"} fw={"bold"}>
                        Penghargaan
                    </Text>
                    <Text
                        py={10}
                        ta={"justify"}
                    >
                        Desa Darmasaba telah berhasil meraih berbagai penghargaan bergengsi yang membuktikan dedikasi dan kerja keras seluruh elemen masyarakat dalam membangun desa yang maju dan berkelanjutan. Berikut ini adalah macam-macam penghargaan yang telah diraih oleh Desa Darmasaba:
                    </Text>
                    <Slider />
                </Stack>
            </Container>
        </Stack>
    )
}
function Slider() {
    const height = 720;
    const width = 1200;
    const theme = useMantineTheme();
    const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
    const autoplay = useRef(Autoplay({ delay: 2000 }));
    const state = useProxy(penghargaanState);
    const roter = useTransitionRouter()

    useEffect(() => {
        const loadData = async () => {
            try {
                await state.findMany.load();
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }
        loadData();
    }, [])

    const data = state.findMany.data || [];

    const slides = data.map((item) => (

        <CarouselSlide key={item.id}>
            <Paper h={"100%"} pos={"relative"} style={{
                backgroundImage: `url(${item.image?.link}) `,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}>
                <Box
                    style={{
                        borderRadius: 16,
                        zIndex: 0,
                    }}
                    pos={"absolute"}
                    w={"100%"}
                    h={"100%"}
                    bg={colors.trans.dark[2]}
                />
                <Stack justify="space-between" h={"100%"} gap={0} p={"lg"} pos={"relative"} >
                    <Box p={"lg"}>
                        <Text fz={"1.5rem"} ta={"center"} c={"white"}>{item.name}</Text>
                    </Box>
                    <Group justify="center" >
                        <Button onClick={() => roter.push(`/darmasaba/penghargaan/${item.id}`)} px={46} radius={"100"} size="md" bg={colors["blue-button"]}>
                            Detail
                        </Button>
                    </Group>
                </Stack>
            </Paper>
        </CarouselSlide>

    ));

    return (
        <Carousel
            c={"white"}
            py={50}
            plugins={[autoplay.current]}
            onMouseEnter={autoplay.current.stop}
            onMouseLeave={autoplay.current.reset}
            w={{ base: 500, md: 800, lg: 900, xl: width }}
            height={height}
            slideSize={{ base: "100%", sm: "50%", md: "33.333333%" }}
            slideGap={{ base: "xl", sm: "md" }}
            loop
            align="start"
            slidesToScroll={mobile ? 1 : 2}
        >
            {slides}
        </Carousel>
    );
}