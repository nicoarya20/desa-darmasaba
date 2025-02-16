/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import colors from "@/con/colors";
import images from "@/con/images";
import ApiFetch from "@/lib/api-fetch";
import { Carousel } from "@mantine/carousel";
import {
  BackgroundImage,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Autoplay from "embla-carousel-autoplay";
import _ from "lodash";
import { useRef } from "react";
import useSWR from "swr";

type DataSlider = {
  id: string;
  name: string;
};
const textHeading = {
  title: "Layanan",
  des: "Terwujudnya Layanan umum bertajuk Sistem administrasi Kependudukan Terintegrasi di Desa berbasi Elektronik, Smart dan Aman",
};
function Content3() {
  const { data, isLoading } = useSWR(
    "/",
    (url) => ApiFetch.api.layanan.get().then(({ data }) => data?.data),
    {
      fallbackData: [],
    }
  );

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
            <Button variant="filled" bg={"dark"} radius={100}>
              Lanjutkan
            </Button>
          </Box>
        </Stack>
      </Container>
      <Slider data={data as any} />
      <Divider />
    </Stack>
  );
}

const height = 720;
function Slider({ data }: { data: DataSlider[] }) {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const autoplay = useRef(Autoplay({ delay: 2000 }));

  const slides = data.map((item) => (
    <Carousel.Slide key={item.id}>
      <BackgroundImage src={images["bg-slide3"]} h={height} p="xl" radius="md">
        <Stack justify="space-between" h={"100%"} gap={0}>
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
            <Button px={46} radius={"100"} size="md">
              Detail
            </Button>
          </Group>
        </Stack>
      </BackgroundImage>
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

export default Content3;
