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

function Layanan() {
  return (
    <Stack pos={"relative"} bg={colors.grey[1]} gap={"xl"} py={"md"}>
      <Container w={{ base: "100%", md: "80%" }} p={"md"}>
        <Stack align="center" gap={"0"}>
          <Text
            fw={"bold"}
            c={colors["blue-button"]}
            fz={{ base: "1.8rem", md: "3.4rem" }}
          >
            {textHeading.title}
          </Text>
          <Text ta={"center"} fz={{ base: "1rem", md: "1.3rem" }}>
            {textHeading.des}
          </Text>
          <Box p={"md"}>
            <Button
              component={Link}
              href={"/darmasaba/desa/layanan"}
              variant="filled"
              bg={colors["blue-button"]}
              radius={100}
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

const height = 720;

function Slider() {
  const state = useProxy(stateLayananDesa);
  const [loading, setLoading] = useState(false);
  const mobile = useMediaQuery("(max-width: 768px)", false);
  const router = useTransitionRouter();

  // Refs for smooth animation
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);
  const animationFrameRef = useRef<number>(0);
  const isHoveredRef = useRef(false);
  
  // Refs for drag functionality
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const velocityRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  
  // Speed configuration
  const normalSpeed = 1.0; // pixels per frame
  const hoverSpeed = 0.3; // slower speed on hover

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

  // Duplicate slides for seamless infinite loop
  // We need at least 3x the data for smooth infinite scrolling
  const slidesData = [...data, ...data, ...data];

  useEffect(() => {
    if (loading || !containerRef.current || slidesData.length === 0) return;

    const container = containerRef.current;
    const slideWidth = container.scrollWidth / slidesData.length;
    const originalDataLength = data.length;

    // Start from the middle set of slides
    scrollPositionRef.current = slideWidth * originalDataLength;
    container.scrollLeft = scrollPositionRef.current;

    const animate = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const slideWidth = container.scrollWidth / slidesData.length;

      // Check if user recently scrolled manually
      const timeSinceLastScroll = Date.now() - lastScrollTimeRef.current;
      const isUserScrolling = timeSinceLastScroll < 100;

      // Only auto-scroll if user is not actively scrolling or dragging
      if (!isDraggingRef.current && !isUserScrolling) {
        const currentSpeed = isHoveredRef.current ? hoverSpeed : normalSpeed;
        scrollPositionRef.current += currentSpeed;

        // Reset position for infinite loop
        if (scrollPositionRef.current >= slideWidth * (originalDataLength * 2)) {
          scrollPositionRef.current -= slideWidth * originalDataLength;
        }

        if (scrollPositionRef.current <= 0) {
          scrollPositionRef.current += slideWidth * originalDataLength;
        }

        container.scrollLeft = scrollPositionRef.current;
      } else {
        // Sync scroll position when user is scrolling
        scrollPositionRef.current = container.scrollLeft;
        
        // Apply momentum/velocity for smooth drag release
        if (!isDraggingRef.current && Math.abs(velocityRef.current) > 0.1) {
          scrollPositionRef.current += velocityRef.current;
          velocityRef.current *= 0.95; // Decay velocity
          container.scrollLeft = scrollPositionRef.current;
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [loading, slidesData.length, data.length, mobile]);

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    isDraggingRef.current = false;
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    isDraggingRef.current = true;
    startXRef.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftRef.current = containerRef.current.scrollLeft;
    velocityRef.current = 0;
    
    containerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 2; // Multiply for faster scroll
    const newScrollLeft = scrollLeftRef.current - walk;
    
    // Calculate velocity for momentum
    velocityRef.current = containerRef.current.scrollLeft - newScrollLeft;
    
    containerRef.current.scrollLeft = newScrollLeft;
    scrollPositionRef.current = newScrollLeft;
    lastScrollTimeRef.current = Date.now();
  };

  const handleMouseUp = () => {
    if (!containerRef.current) return;
    
    isDraggingRef.current = false;
    containerRef.current.style.cursor = 'grab';
  };

  // Wheel scroll handler
  const handleWheel = (e: React.WheelEvent) => {
    if (!containerRef.current) return;
    
    e.preventDefault();
    containerRef.current.scrollLeft += e.deltaY;
    scrollPositionRef.current = containerRef.current.scrollLeft;
    lastScrollTimeRef.current = Date.now();
  };

  if (loading) {
    return <Skeleton height={height} />;
  }

  if (data.length === 0) {
    return (
      <Container>
        <Text ta="center" c="dimmed">
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
        overflow: "hidden",
        cursor: "grab",
        userSelect: "none",
      }}
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
              flex: `0 0 ${mobile ? "100%" : "calc(33.333% - 1rem)"}`,
              minWidth: mobile ? "100%" : "calc(33.333% - 1rem)",
            }}
          >
            <Paper
              h={height}
              pos={"relative"}
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
                pos={"absolute"}
                w={"100%"}
                h={"100%"}
                bg={colors.trans.dark[2]}
              />
              <Stack
                justify="space-between"
                h={"100%"}
                gap={0}
                p={"lg"}
                pos={"relative"}
              >
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
                  <Button
                    onClick={() =>
                      router.push(`/darmasaba/desa/layanan/${item.id}`)
                    }
                    px={46}
                    radius={"100"}
                    size="md"
                    bg={colors["blue-button"]}
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