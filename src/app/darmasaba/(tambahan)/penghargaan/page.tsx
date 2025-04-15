'use client';
import colors from "@/con/colors";
import { Carousel, CarouselSlide } from "@mantine/carousel";
import { Box, Button, Container, Group, Paper, Stack, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useRef } from "react";
import BackButton from "../../(pages)/desa/layanan/_com/BackButto";


const data = [
    {
        id: 1,
        images: "/api/img/penghargaan-2.png",
        juara: "Juara 2",
        deskripsi: "Lomba Video Pendek Potensi dan Peluang Investasi di Desa Kabupaten Badung 2024",
        link: "/darmasaba/penghargaan/juara-2-lomba-video-pendek-potensi-dan-peluang-investasi-di-desa-kabupaten-badung-2024"
    },
    {
        id: 2,
        images: "/api/img/penghargaan-3.png",
        juara: "Juara 2",
        deskripsi: "Duta Invenstasi Kabupaten Badung 2024",
        link: "/darmasaba/penghargaan/juara-2-duta-invenstasi-kabupaten-badung-2024"
    },
    {
        id: 3,
        images: "/api/img/penghargaan-1.png",
        juara: "Juara Favorit",
        deskripsi: "Lomba Video Pendek Potensi dan Peluang Investasi di Desa Kabupaten Badung 2024",
        link: "/darmasaba/penghargaan/juara-favorit-lomba-video-pendek-potensi-dan-peluang-investasi-di-desa-kabupaten-badung-2024"
    },
    {
        id: 4,
        images: "/api/img/penghargaan-2.png",
        juara: "Juara 2",
        deskripsi: "Lomba Video Pendek Potensi dan Peluang Investasi di Desa Kabupaten Badung 2024",
        link: "/darmasaba/penghargaan/juara-2-lomba-video-pendek-potensi-dan-peluang-investasi-di-desa-kabupaten-badung-2024"
    },
    {
        id: 5,
        images: "/api/img/penghargaan-3.png",
        juara: "Juara 2",
        deskripsi: "Duta Invenstasi Kabupaten Badung 2024",
        link: "/darmasaba/penghargaan/juara-2-duta-invenstasi-kabupaten-badung-2024"
    },
    {
        id: 6,
        images: "/api/img/penghargaan-1.png",
        juara: "Juara Favorit",
        deskripsi: "Lomba Video Pendek Potensi dan Peluang Investasi di Desa Kabupaten Badung 2024",
        link: "/darmasaba/penghargaan/juara-favorit-lomba-video-pendek-potensi-dan-peluang-investasi-di-desa-kabupaten-badung-2024"
    }
]
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

    const slides = data.map((item) => (

        <CarouselSlide key={item.id}>
            <Paper h={"100%"} pos={"relative"} style={{
                backgroundImage: `url(${item.images}) `,
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
                        <Text fz={"2.3rem"} fw={"bold"} ta={"center"} c={"white"}>{item.juara}</Text>
                        <Text fz={"1.5rem"} ta={"center"} c={"white"}>{item.deskripsi}</Text>
                    </Box>
                    <Group justify="center">
                        <Button component={Link} href={item.link} px={46} radius={"100"} size="md" bg={colors["blue-button"]}>
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
            w={{base: 500, md: 800, lg: 900 , xl: width}}
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