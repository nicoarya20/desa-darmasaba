/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import penghargaanState from "@/app/admin/(dashboard)/_state/desa/penghargaan";
import { Stack, Box, Container, Button, Text, Loader, Paper, Center, ActionIcon } from "@mantine/core";
import { IconAward, IconArrowRight, IconPlayerPlay } from "@tabler/icons-react";
import { useTransitionRouter } from 'next-view-transitions';
import { useEffect, useState, useRef } from "react";
import { useProxy } from "valtio/utils";
import { useMediaQuery } from "@mantine/hooks";

function Penghargaan() {
  const router = useTransitionRouter();
  const state = useProxy(penghargaanState);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Deteksi iOS dengan lebih akurat
  const isIOS = typeof window !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) // iPad dengan iPadOS 13+
  );

  useEffect(() => {
    // Di iOS, coba autoplay dulu, kalau gagal tampilkan fallback
    if (isIOS && videoRef.current) {
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Autoplay berhasil
            setShowVideo(true);
            setIsVideoLoaded(true);
          })
          .catch(() => {
            // Autoplay gagal, tampilkan fallback
            setShowVideo(false);
            setVideoError(true);
          });
      }
    }
  }, [isIOS]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await state.findMany.load();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePlayVideo = () => {
    setShowVideo(true);
    setVideoError(false);
    
    // Paksa play video setelah user interaction
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(err => {
          console.error("Video play error:", err);
          setVideoError(true);
        });
      }
    }, 100);
  };

  // kalau mobile ambil 1 data aja, kalau desktop ambil 3
  const data = state.findMany.data?.slice(0, isMobile ? 1 : 3);

  return (
    <Stack pos="relative" h="auto" mih={{ base: 500, md: 720 }} style={{ overflow: 'hidden' }}>
      {/* Video Layer */}
      {showVideo && !videoError && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={() => {
            console.error("Video load error");
            setVideoError(true);
            setShowVideo(false);
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isVideoLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
            zIndex: 0,
          }}
        >
          <source src="/assets/videos/award.mp4" type="video/mp4" />
        </video>
      )}

      {/* Fallback Image + Play Button */}
      {(!showVideo || videoError) && (
        <Box
          onClick={handlePlayVideo}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: "url('/mangupuraaward.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            cursor: 'pointer',
            zIndex: 0,
          }}
        >
          <Center 
            style={{ 
              width: '100%', 
              height: '100%',
              background: 'rgba(0,0,0,0.3)', // overlay gelap agar icon terlihat
            }}
          >
            <ActionIcon 
              size={80} 
              radius="xl" 
              variant="filled"
              color="blue"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <IconPlayerPlay size={40} color="var(--mantine-color-blue-6)" />
            </ActionIcon>
          </Center>
        </Box>
      )}

      {/* Overlay Gradient + Content */}
      <Box
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85))",
          zIndex: 1,
        }}
      >
        <Container w={{ base: "100%", md: "80%" }} mih={{ base: 500, md: 720 }} p="xl">
          <Stack justify="center" align="center" gap="xl" h="100%">
            <Text
              fw={900}
              fz={{ base: "2rem", md: "2.8rem" }}
              ta="center"
              variant="gradient"
              gradient={{ from: "cyan", to: "blue", deg: 60 }}
            >
              Penghargaan Desa
            </Text>

            {loading ? (
              <Stack align="center" gap="sm">
                <Loader color="blue" size="lg" />
                <Text c="gray.3" fz="lg">Sedang memuat data penghargaan...</Text>
              </Stack>
            ) : data && data.length > 0 ? (
              <Stack gap="md" w="100%" maw={600}>
                {data.map((v, k) => (
                  <Paper
                    key={k}
                    withBorder
                    radius="xl"
                    p="lg"
                    shadow="xl"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      backdropFilter: "blur(12px)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Stack align="center" gap="xs">
                      <IconAward size={40} color="var(--mantine-color-blue-4)" />
                      <Text fz="lg" fw={700} c="white" ta="center">
                        {v.name}
                      </Text>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Stack align="center" gap="xs">
                <IconAward size={48} color="var(--mantine-color-gray-5)" />
                <Text c="gray.4" fz="lg" ta="center">
                  Belum ada penghargaan yang tercatat
                </Text>
              </Stack>
            )}

            <Button
              size="lg"
              radius="xl"
              variant="gradient"
              gradient={{ from: "#26667F", to: "#124170", deg: 45 }}
              rightSection={<IconArrowRight size={20} />}
              onClick={() => router.push("/darmasaba/penghargaan")}
            >
              Lihat Semua Penghargaan
            </Button>
          </Stack>
        </Container>
      </Box>
    </Stack>
  );
}

export default Penghargaan;