/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import stateLayananDesa from "@/app/admin/(dashboard)/_state/desa/layananDesa";
import colors from "@/con/colors";
import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import _ from "lodash";
import { useTransitionRouter } from "next-view-transitions";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useProxy } from "valtio/utils";

const textHeading = {
  title: "Layanan",
  des: "Layanan adalah fitur yang membantu warga desa mengakses berbagai kebutuhan administrasi, informasi, dan bantuan secara cepat, mudah, dan transparan. Dengan fitur ini, semua layanan desa ada dalam genggaman Anda!",
};

const HEIGHT = 720;

function Layanan() {
  // responsive breakpoints: base = mobile, md = desktop/tablet landscape
  return (
    <Stack pos="relative" bg={colors.grey[1]} gap="xl" py="md">
      <Container w={{ base: "100%", md: "80%" }} p="md">
        <Stack align="center" gap="0">
          {/* Main title - semantic h1 */}
          <Text
            component="h1"
            fw={700}
            c={colors["blue-button"]}
            ta="center"
            // responsive sizes: mobile ~28px, desktop ~48px
            fz={{ base: "1.75rem", md: "3rem" }}
            // tighter line-height for large headings, slightly more compact on desktop
            style={{ lineHeight: "1.05" }}
          >
            {textHeading.title}
          </Text>

          {/* Description - readable line-height and constrained width on desktop */}
          <Text
            component="p"
            ta="center"
            fz={{ base: "0.95rem", md: "1.15rem" }}
            // more comfortable line-height for paragraphs
            style={{
              lineHeight: "1.6",
              maxWidth: "70ch",
              marginTop: 8,
            }}
            c="black"
          >
            {textHeading.des}
          </Text>

          <Box p="md">
            <Button
              component={Link}
              href="/darmasaba/desa/layanan"
              variant="filled"
              bg={colors["blue-button"]}
              radius={100}
              // accessible sizing: slightly smaller on mobile, comfortable on desktop
              style={{
                paddingLeft: 20,
                paddingRight: 20,
                fontSize: "md",
                // ensure button text doesn't overflow on very narrow screens
                whiteSpace: "nowrap",
              }}
            >
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

function Slider() {
  const state = useProxy(stateLayananDesa);
  const [loading, setLoading] = useState(false);
  const mobile = useMediaQuery("(max-width: 768px)", false);
  const router = useTransitionRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const velocityRef = useRef(0);
  const lastScrollRef = useRef(0);

  const SPEED_NORMAL = 1.0;
  const SPEED_HOVER = 0.3;
  const VELOCITY_DECAY = 0.95;
  const SCROLL_THRESHOLD = 100;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await state.suratKeterangan.findMany.load();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const data = state.suratKeterangan.findMany.data || [];

  // Triple data untuk infinite loop (desktop only)
  const slidesData = mobile ? data : [...data, ...data, ...data];

  // Auto-scroll animation untuk desktop
  useEffect(() => {
    if (loading || !containerRef.current || data.length === 0 || mobile) return;

    const container = containerRef.current;
    const slideWidth = container.scrollWidth / slidesData.length;
    const originalLength = data.length;

    // Start dari middle set
    scrollPosRef.current = slideWidth * originalLength;
    container.scrollLeft = scrollPosRef.current;

    const animate = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const slideWidth = container.scrollWidth / slidesData.length;
      const timeSinceScroll = Date.now() - lastScrollRef.current;
      const isUserScrolling = timeSinceScroll < SCROLL_THRESHOLD;

      if (!isDraggingRef.current && !isUserScrolling) {
        const speed = isHoveredRef.current ? SPEED_HOVER : SPEED_NORMAL;
        scrollPosRef.current += speed;

        // Reset untuk infinite loop
        if (scrollPosRef.current >= slideWidth * (originalLength * 2)) {
          scrollPosRef.current -= slideWidth * originalLength;
        }
        if (scrollPosRef.current <= 0) {
          scrollPosRef.current += slideWidth * originalLength;
        }

        container.scrollLeft = scrollPosRef.current;
      } else {
        scrollPosRef.current = container.scrollLeft;

        // Momentum untuk drag release
        if (!isDraggingRef.current && Math.abs(velocityRef.current) > 0.1) {
          scrollPosRef.current += velocityRef.current;
          velocityRef.current *= VELOCITY_DECAY;
          container.scrollLeft = scrollPosRef.current;
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [loading, data.length, mobile]);

  const handleMouseEnter = () => {
    if (!mobile) isHoveredRef.current = true;
  };

  const handleMouseLeave = () => {
    if (!mobile) {
      isHoveredRef.current = false;
      isDraggingRef.current = false;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || mobile) return;

    isDraggingRef.current = true;
    startXRef.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftRef.current = containerRef.current.scrollLeft;
    velocityRef.current = 0;
    containerRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current || mobile) return;

    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 2;
    const newScrollLeft = scrollLeftRef.current - walk;

    velocityRef.current = containerRef.current.scrollLeft - newScrollLeft;
    containerRef.current.scrollLeft = newScrollLeft;
    scrollPosRef.current = newScrollLeft;
    lastScrollRef.current = Date.now();
  };

  const handleMouseUp = () => {
    if (!containerRef.current || mobile) return;

    isDraggingRef.current = false;
    containerRef.current.style.cursor = "grab";
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!containerRef.current || mobile) return;

    // Horizontal scroll dengan wheel delta
    containerRef.current.scrollLeft += e.deltaY;
    scrollPosRef.current = containerRef.current.scrollLeft;
    lastScrollRef.current = Date.now();
  };

  if (loading) {
    return <Skeleton height={HEIGHT} />;
  }

  if (data.length === 0) {
    return (
      <Container>
        <Text ta="center" c="dimmed" fz={{ base: "0.95rem", md: "1rem" }}>
          Tidak ada layanan tersedia
        </Text>
      </Container>
    );
  }

  return (
    <Box
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      style={{
        overflowX: mobile ? "auto" : "hidden",
        overflowY: "hidden",
        cursor: mobile ? "default" : "grab",
        userSelect: "none",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      // ensure keyboard accessibility: allow focus outline when focused
      tabIndex={0}
    >
      <Box
        style={{
          display: "flex",
          gap: mobile ? "1rem" : "1.5rem",
          paddingLeft: mobile ? "1rem" : "1.5rem",
          paddingRight: mobile ? "1rem" : "1.5rem",
        }}
      >
        {slidesData.map((item, index) => (
          <Box
            key={`${item.id}-${index}`}
            style={{
              flex: `0 0 ${mobile ? "90%" : "calc(33.333% - 1rem)"}`,
              minWidth: mobile ? "90%" : "calc(33.333% - 1rem)",
            }}
          >
            <Paper
              h={HEIGHT}
              pos="relative"
              style={{
                backgroundImage: `url(${item.image?.link})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  borderRadius: 8,
                  zIndex: 0,
                }}
                pos="absolute"
                w="100%"
                h="100%"
                bg={colors.trans.dark[2]}
              />
              <Stack
                justify="space-between"
                h="100%"
                gap={0}
                p="lg"
                pos="relative"
              >
                <Box p="lg">
                  {/* slide title - semantic h2 */}
                  <Text
                    component="h2"
                    fw={700}
                    c="white"
                    fz={{ base: "1.25rem", md: "2.4rem" }}
                    // tighter heading line-height but ensure readability on mobile
                    style={{
                      textAlign: "center",
                      lineHeight: mobile ? "1.15" : "1.02",
                      // clamp long names visually
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                    title={_.startCase(item.name)}
                  >
                    {_.startCase(item.name)}
                  </Text>

                  {/* optional short description - rendered if exists */}
                  {item.description ? (
                    <Text
                      component="p"
                      mt="sm"
                      c="white"
                      fz={{ base: "0.9rem", md: "1rem" }}
                      style={{ lineHeight: "1.5", textAlign: "center" }}
                    >
                      {item.description}
                    </Text>
                  ) : null}
                </Box>

                <Group justify="center" mb="lg">
                  <Button
                    onClick={() =>
                      router.push(`/darmasaba/desa/layanan/${item.id}`)
                    }
                    px={mobile ? 20 : 46}
                    radius="100"
                    size={mobile ? "sm" : "md"}
                    bg={colors["blue-button"]}
                    // ensure button text readable on all sizes
                    style={{
                      fontSize: mobile ? "0.95rem" : "1rem",
                      whiteSpace: "nowrap",
                    }}
                    aria-label={`Detail layanan ${_.startCase(item.name)}`}
                  >
                    Detail
                  </Button>
                </Group>
              </Stack>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default Layanan;
