/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import penghargaanState from "@/app/admin/(dashboard)/_state/desa/penghargaan";
import colors from "@/con/colors";
import { Carousel, CarouselSlide } from "@mantine/carousel";
import { Box, Button, Container, Group, Paper, Stack, Text, useMantineTheme, Skeleton } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Autoplay from "embla-carousel-autoplay";
import { IconAward, IconArrowRight } from "@tabler/icons-react";
import { useTransitionRouter } from "next-view-transitions";
import { useEffect, useRef } from "react";
import { useProxy } from "valtio/utils";
import BackButton from "../../(pages)/desa/layanan/_com/BackButto";

export default function Page() {
  return (
    <Stack pos="relative" bg={colors.grey[1]} py="xl" gap={32}>
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: "100%", md: "60%" }}>
        <Stack align="center" gap="sm">
          <Group gap="xs">
            <IconAward size={40} color={colors["blue-button"]} />
            <Text fz={{ base: "2rem", md: "3.2rem" }} fw={800} variant="gradient" gradient={{ from: "#1C6EA4", to: "#69BFF8" }}>
              Penghargaan Desa
            </Text>
          </Group>
          <Text fz="lg" c="dimmed" ta="center">
            Desa Darmasaba berhasil meraih beragam penghargaan bergengsi yang mencerminkan dedikasi dan kerja keras masyarakat dalam membangun desa yang maju dan berkelanjutan.
          </Text>
          <Slider />
        </Stack>
      </Container>
    </Stack>
  );
}

function Slider() {
  const height = 500;
  const width = 1200;
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const autoplay = useRef(Autoplay({ delay: 3000 }));
  const state = useProxy(penghargaanState);
  const router = useTransitionRouter();

  useEffect(() => {
    state.findMany.load();
  }, []);

  const data = state.findMany.data || [];
  const loading = state.findMany.loading;

  if (loading) {
    return (
      <Group justify="center" py="xl">
        <Skeleton w={300} h={200} radius="lg" />
        <Skeleton w={300} h={200} radius="lg" visibleFrom="sm" />
        <Skeleton w={300} h={200} radius="lg" visibleFrom="md" />
      </Group>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <Stack align="center" py="xl">
        <IconAward size={56} color={colors["blue-button"]} />
        <Text fz="lg" fw={600} c="dimmed">
          Belum ada penghargaan yang ditambahkan
        </Text>
      </Stack>
    );
  }

  const slides = data.map((item) => (
    <CarouselSlide key={item.id}>
      <Paper
        h="100%"
        radius="lg"
        shadow="md"
        pos="relative"
        style={{
          backgroundImage: `url(${item.image?.link})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          pos="absolute"
          inset={0}
          bg="linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.3))"
          style={{ borderRadius: 16 }}
        />
        <Stack justify="flex-end" h="100%" gap="sm" p="lg" pos="relative">
          <Text fz="xl" fw={700} ta="center" c="white">
            {item.name}
          </Text>
          <Group justify="center">
            <Button
              onClick={() => router.push(`/darmasaba/penghargaan/${item.id}`)}
              size="md"
              radius="xl"
              rightSection={<IconArrowRight size={18} />}
              variant="gradient"
              gradient={{ from: "#1C6EA4", to: "#69BFF8" }}
            >
              Lihat Detail
            </Button>
          </Group>
        </Stack>
      </Paper>
    </CarouselSlide>
  ));

  return (
    <Carousel
      py="xl"
      plugins={[autoplay.current]}
      onMouseEnter={autoplay.current.stop}
      onMouseLeave={autoplay.current.reset}
      w={{ base: "100%", sm: "90%", md: "80%", lg: width }}
      h={height}
      slideSize={{ base: "100%", sm: "50%", md: "33.333333%" }}
      slideGap="md"
      loop
      align="start"
      slidesToScroll={mobile ? 1 : 2}
    >
      {slides}
    </Carousel>
  );
}
