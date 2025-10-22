/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import penghargaanState from "@/app/admin/(dashboard)/_state/desa/penghargaan";
import colors from "@/con/colors";
import { Carousel } from "@mantine/carousel";
import { Box, Button, Container, Group, Paper, Skeleton, Stack, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconArrowRight, IconAward } from "@tabler/icons-react";
import Autoplay from "embla-carousel-autoplay";
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
      <Container w={{ base: "100%", md: "90%", lg: "60%" }}>

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
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const tablet = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const autoplay = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));
  const state = useProxy(penghargaanState);
  const router = useTransitionRouter();

  useEffect(() => {
    state.findMany.load();
  }, []);

  const data = state.findMany.data || [];
  const loading = state.findMany.loading;

  if (loading) {
    return (
      <Group justify="center" py="xl" gap="md">
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
    <Carousel.Slide key={item.id}>
      <Paper
        radius="lg"
        shadow="md"
        pos="relative"
        style={{
          height: "100%",
          backgroundImage: `url(${item.image?.link})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <Box
          pos="absolute"
          inset={0}
          bg="linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))"
          style={{ borderRadius: 16 }}
        />
        <Stack justify="flex-end" h="100%" gap="sm" p="lg" pos="relative">
          <Text
            fz={{ base: "md", sm: "lg", md: "xl" }}
            fw={700}
            ta="center"
            c="white"
            lineClamp={3}
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}
          >
            {item.name}
          </Text>
          <Group justify="center">
            <Button
              onClick={() =>
                router.push(`/darmasaba/penghargaan/${item.id}`)
              }
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
    </Carousel.Slide>
  ));

  return (
    <Box 
      pos="relative" 
      w="100%" 
      mx="auto" 
      px={{ base: "md", sm: "xl", md: "2rem", lg: "3rem" }}
      style={{ 
        maxWidth: 1300,
      }}
    >
      <Carousel
        py="xl"
        w="100%"
        h={{ base: 320, sm: 380, md: 420, lg: 450 }}
        slideSize={{
          base: "100%",  // Mobile: 1
          sm: "50%",     // Tablet kecil (≥768): 2
          md: "50%",     // 1024px: tetap 2
          lg: "33.333%", // Desktop besar: 3
        }}
        slideGap={{ base: "md", sm: "md", md: "lg" }}
        loop
        align="start"
        slidesToScroll={mobile ? 1 : tablet ? 2 : 3}
        plugins={[autoplay.current]}
        onMouseEnter={autoplay.current.stop}
        onMouseLeave={autoplay.current.reset}
        withControls={data.length > 3}
        draggable={data.length > 1}
        styles={{
          root: {
            position: "relative",
          },
          viewport: {
            overflow: "hidden",
          },
          container: {
            alignItems: "stretch",
          },
          control: {
            zIndex: 20,
            backgroundColor: "rgba(255,255,255,0.95)",
            color: colors["blue-button"],
            border: `2px solid ${colors["blue-button"]}`,
            width: 46,
            height: 46,
            borderRadius: "50%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease",
            '&:hover': {
              backgroundColor: colors["blue-button"],
              color: "white",
              transform: "scale(1.1)",
            },
            '&[data-inactive]': {
              opacity: 0,
              cursor: 'default',
            },
          },
          controls: {
            position: "absolute",
            top: mobile ? "70%" : tablet ? "65%" : "60%",
            transform: "translateY(-50%)",
            width: mobile ? "100%" : tablet ? "calc(100% + 60px)" : "calc(100% + 100px)",
            left: mobile ? "0" : tablet ? "-30px" : "-50px",
            right: mobile ? "0" : tablet ? "-30px" : "-50px",
            padding: "0",
            justifyContent: "space-between",
            zIndex: 30,
          },
        }} 
      >
        {slides}
      </Carousel>
    </Box>
  );
}