/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import colors from "@/con/colors";
import ApiFetch from "@/lib/api-fetch";
import { Carousel } from "@mantine/carousel";
import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  useMantineTheme
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Autoplay from "embla-carousel-autoplay";
import _ from "lodash";
import { useTransitionRouter } from "next-view-transitions";
import { useRef } from "react";
import useSWR from "swr";

const data = [
  {
    id: 1,
    images: "/api/img/test.png",
    name: "Surat Keterangan Domisili Organisasi"
  },
  {
    id: 2,
    images: "/api/img/test-3.jpeg",
    name: "Surat Keterangan Penghasilan"
  },
  {
    id: 3,
    images: "/api/img/domisili.jpeg",
    name: "Surat Keterangan Tidak Mampu"
  },
  {
    id: 4,
    images: "/api/img/kelahiran.jpeg",
    name: "Surat Keterangan Kelahiran"
  },
  {
    id: 5,
    images: "/api/img/keterangan-usaha.jpeg",
    name: "Surat Keterangan Usaha"
  },
  {
    id: 6,
    images: "/api/img/kematian.jpeg",
    name: "Surat Keterangan Kematian"
  },

]
const textHeading = {
  title: "Layanan",
  des: "Layanan adalah fitur yang membantu warga desa mengakses berbagai kebutuhan administrasi, informasi, dan bantuan secara cepat, mudah, dan transparan. Dengan fitur ini, semua layanan desa ada dalam genggaman Anda!",
};
function Layanan() {
  const { data, isLoading } = useSWR(
    "/",
    (url) => ApiFetch.api.layanan.get().then(({ data }) => data?.data),
    {
      fallbackData: [],
    }
  );

  const router = useTransitionRouter()

  return (
    <Stack pos={"relative"} bg={colors.grey[1]} gap={"42"} py={"xl"}>
      <Container w={{ base: "100%", md: "50%" }} p={"xl"}>
        <Stack align="center" gap={"0"}>
          <Text fz={"3.4rem"} fw={"bold"}>
            {textHeading.title}
          </Text>
          <Text
            style={{
              textAlign: "center",
            }}
          >
            {textHeading.des}
          </Text>
          <Box p={"md"}>
            <Button onClick={() => {
              router.push("/layanan")
            }} variant="filled" bg={colors["blue-button"]} radius={100}>
              Detail
            </Button>
          </Box>
        </Stack>
      </Container>
      <Slider />
      <Divider />
    </Stack>
  );
}

const height = 720;
function Slider() {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const autoplay = useRef(Autoplay({ delay: 2000 }));
  const router = useTransitionRouter()

  const slides = data.map((item) => (
    <Carousel.Slide key={item.id} >
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
            <Text
              
              fw={"bold"}
              c={"white"}
              size={"3.5rem"}
              style={{
                textAlign: "center",
              }}
            >
              {_.startCase(item.name)}
            </Text>
          </Box>
          <Group justify="center">
            <Button onClick={() => {
              router.push(`/layanan/${item.id}`)
            }} px={46} radius={"100"} size="md" bg={colors["blue-button"]}>
              Detail
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Carousel.Slide>
  ));

  return (
    <Carousel
      plugins={[autoplay.current]}
      onMouseEnter={autoplay.current.stop}
      onMouseLeave={autoplay.current.reset}
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

export default Layanan;
