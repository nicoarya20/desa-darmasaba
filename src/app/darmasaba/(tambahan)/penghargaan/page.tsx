/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import penghargaanState from "@/app/admin/(dashboard)/_state/desa/penghargaan";
import colors from "@/con/colors";
import { Box, Button, Container, Group, Paper, Skeleton, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconArrowRight, IconAward } from "@tabler/icons-react";
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
        </Stack>
      </Container>
      <Slider />
    </Stack>
  );
}

function Slider() {
  const mobile = useMediaQuery("(max-width: 768px)", false);
  const state = useProxy(penghargaanState);
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
  const hoverSpeed = 0.5; // slower speed on hover

  useEffect(() => {
    state.findMany.load();
  }, []);

  const data = state.findMany.data || [];
  const loading = state.findMany.loading;

  // Duplicate slides for seamless infinite loop
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
    const walk = (x - startXRef.current) * 2;
    const newScrollLeft = scrollLeftRef.current - walk;
    
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
    return (
      <Group justify="center" py="xl" gap="md">
        <Skeleton w={300} h={400} radius="lg" />
        <Skeleton w={300} h={400} radius="lg" visibleFrom="sm" />
        <Skeleton w={300} h={400} radius="lg" visibleFrom="md" />
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

  return (
    <Box
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      py="xl"
      style={{
        overflow: "hidden",
        cursor: "grab",
        userSelect: "none",
        position: "relative",
      }}
    >
      {/* Blur edges effect */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "120px",
          height: "100%",
          background: "linear-gradient(to right, rgba(249, 250, 251, 1), rgba(249, 250, 251, 0))",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />
      <Box
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "120px",
          height: "100%",
          background: "linear-gradient(to left, rgba(249, 250, 251, 1), rgba(249, 250, 251, 0))",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />

      <Box
        style={{
          display: "flex",
          gap: mobile ? "1rem" : "1.5rem",
          paddingLeft: mobile ? "1rem" : "2rem",
          paddingRight: mobile ? "1rem" : "2rem",
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
              radius="lg"
              shadow="md"
              pos="relative"
              style={{
                height: mobile ? "380px" : "450px",
                backgroundImage: `url(${item.image?.link})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
            >
              <Box
                pos="absolute"
                inset={0}
                bg="linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3))"
                style={{ borderRadius: 16 }}
              />
              <Stack justify="flex-end" h="100%" gap="sm" p="lg" pos="relative">
                <Text
                  fz={{ base: "lg", sm: "xl", md: "1.5rem" }}
                  fw={700}
                  ta="center"
                  c="white"
                  lineClamp={3}
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
                >
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
                    style={{
                      transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    Lihat Detail
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