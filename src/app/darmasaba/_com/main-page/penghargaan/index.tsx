/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import penghargaanState from "@/app/admin/(dashboard)/_state/desa/penghargaan";
import {
  Stack,
  Box,
  Container,
  Button,
  Text,
  Loader,
  Paper,
  Center,
  ActionIcon,
  Title,
} from "@mantine/core";
import { IconAward, IconArrowRight, IconPlayerPlay } from "@tabler/icons-react";
import { useTransitionRouter } from "next-view-transitions";
import { useEffect, useState, useRef } from "react";
import { useProxy } from "valtio/utils";
import { useMediaQuery } from "@mantine/hooks";

function Penghargaan() {
  const router = useTransitionRouter();
  const state = useProxy(penghargaanState);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasTriedAutoplay = useRef(false);

  // ---- TYPOGRAPHY SCALE (RESPONSIVE) ----
  // ukuran dalam px, lh = line-height
  const TYPO = {
    // utama / hero title
    title: { base: 22, md: 36, lh: 1.08 }, // lebih menonjol di desktop
    // subheading / loader / tagline
    subtitle: { base: 14, md: 16, lh: 1.35 },
    // teks body / deskripsi umum
    body: { base: 14, md: 16, lh: 1.6 },
    // caption / small notes
    small: { base: 12, md: 13, lh: 1.4 },
    // judul dalam kartu (card title)
    paperTitle: { base: 15, md: 18, lh: 1.25 },
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await state.findMany.load();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Attempt autoplay setelah video loaded
  useEffect(() => {
    if (isVideoLoaded && videoRef.current && !hasTriedAutoplay.current) {
      hasTriedAutoplay.current = true;

      const attemptAutoplay = async () => {
        try {
          // Pastikan video muted sebelum play
          videoRef.current!.muted = true;
          await videoRef.current!.play();
          setShowPlayButton(false);
          console.log("✅ Autoplay berhasil");
        } catch (err) {
          console.warn("⚠️ Autoplay diblokir browser:", err);
          // Tampilkan tombol play jika autoplay gagal
          setShowPlayButton(true);
        }
      };

      // Delay sedikit untuk memastikan video siap
      setTimeout(attemptAutoplay, 100);
    }
  }, [isVideoLoaded]);

  // Handle manual play
  const handlePlayVideo = async () => {
    if (videoRef.current) {
      try {
        videoRef.current.muted = true;
        await videoRef.current.play();
        setShowPlayButton(false);
        setVideoError(false);
      } catch (err) {
        console.error("❌ Gagal memutar video:", err);
        setVideoError(true);
      }
    }
  };

  // Tampilkan maksimal 3 penghargaan (mobile & desktop)
  const data = state.findMany.data?.slice(0, 3);

  return (
    <Stack pos="relative" h="auto" mih={{ base: 500, md: 720 }} style={{ overflow: "hidden" }}>
      {/* Video background */}
      {!videoError && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          webkit-playsinline="true"
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={() => {
            console.error("❌ Video gagal dimuat");
            setVideoError(true);
          }}
          onCanPlayThrough={() => {
            console.log("✅ Video siap diputar");
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isVideoLoaded ? 1 : 0,
            transition: "opacity 0.5s ease",
            zIndex: 0,
          }}
        >
          <source src="/assets/videos/award.mp4" type="video/mp4" />
          Browser Anda tidak mendukung video.
        </video>
      )}

      {/* Fallback background image */}
      {(videoError || !isVideoLoaded) && (
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "url('/mangupuraaward.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: 0,
          }}
        />
      )}

      {/* Tombol Play (muncul jika autoplay gagal atau video error) */}
      {(showPlayButton || videoError) && (
        <Center
          onClick={handlePlayVideo}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            cursor: "pointer",
            zIndex: 2,
            pointerEvents: showPlayButton || videoError ? "auto" : "none",
          }}
        >
          <ActionIcon
            size={isMobile ? 64 : 80}
            radius="xl"
            variant="filled"
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              animation: "pulse 2s infinite",
            }}
            aria-label="Play background video"
          >
            <IconPlayerPlay size={isMobile ? 34 : 40} color="var(--mantine-color-blue-6)" />
          </ActionIcon>
        </Center>
      )}

      {/* Overlay konten — relative (normal flow) agar section ikut tumbuh
          mengikuti tinggi konten. Kalau absolute + height:100%, tinggi section
          terkunci ke mih dan konten yang melebihi (mis. tombol) kena clip. */}
      <Box
        style={{
          width: "100%",
          position: "relative",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85))",
          zIndex: 1,
        }}
      >
        <Container w={{ base: "100%", md: "80%" }} maw={1100} mih={{ base: 500, md: 720 }} p={{ base: "lg", md: "xl" }}>
          <Stack justify="center" align="center" gap="xl" h="100%">
            {/* Hero Title - pakai Title agar semantics lebih jelas */}
            <Title
              order={2}
              style={{
                fontWeight: 800,
                lineHeight: TYPO.title.lh,
                // Mantine support fz prop but inline style fallback ok:
                fontSize: isMobile ? TYPO.title.base : TYPO.title.md,
                textAlign: "center",
                // gradient via CSS text-fill technique (ke Mantine gradient prop juga bisa)
                background: "-webkit-linear-gradient(60deg, #22D3EE 0%, #3B82F6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              aria-label="Penghargaan Desa"
            >
              Penghargaan Desa
            </Title>

            {/* Content area */}
            {loading ? (
              <Stack align="center" gap="sm">
                <Loader color="blue" size={isMobile ? "md" : "lg"} />
                <Text
                  c="gray.3"
                  fz={isMobile ? TYPO.subtitle.base : TYPO.subtitle.md}
                  lh={TYPO.subtitle.lh}
                  ta="center"
                >
                  Sedang memuat data penghargaan...
                </Text>
              </Stack>
            ) : data && data.length > 0 ? (
              <Stack gap="md" w="100%" maw={600}>
                {data.map((v, k) => (
                  <Paper
                    key={k}
                    withBorder
                    radius="xl"
                    p={isMobile ? "md" : "lg"}
                    shadow="xl"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      backdropFilter: "blur(12px)",
                      transition: "all 0.3s ease",
                    }}
                    aria-label={`Penghargaan ${v.name}`}
                  >
                    <Stack align="center" gap="xs">
                      <IconAward size={isMobile ? 36 : 40} color="var(--mantine-color-blue-4)" />
                      <Text
                        // card title: lebih tegas
                        fz={isMobile ? TYPO.paperTitle.base : TYPO.paperTitle.md}
                        fw={700}
                        c="white"
                        ta="center"
                        lh={TYPO.paperTitle.lh}
                        style={{ wordBreak: "break-word" }}
                        title={v.name}
                        lineClamp={3}
                      >
                        {v.name}
                      </Text>

                      {/* Jika ingin menambahkan deskripsi ringkas di card, gunakan body scale */}
                      {v.description && (
                        <Text
                          fz={isMobile ? TYPO.body.base : TYPO.body.md}
                          c="gray.2"
                          ta="center"
                          lh={TYPO.body.lh}
                          style={{ maxWidth: 520 }}
                          lineClamp={2}
                        >
                          {v.description}
                        </Text>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Stack align="center" gap="xs">
                <IconAward size={isMobile ? 40 : 48} color="var(--mantine-color-gray-5)" />
                <Text
                  c="gray.4"
                  fz={isMobile ? TYPO.body.base : TYPO.body.md}
                  ta="center"
                  lh={TYPO.body.lh}
                >
                  Belum ada penghargaan yang tercatat
                </Text>
              </Stack>
            )}

            <Button
              size={isMobile ? "md" : "lg"}
              radius="xl"
              variant="gradient"
              gradient={{ from: "#26667F", to: "#124170", deg: 45 }}
              rightSection={<IconArrowRight size={isMobile ? 16 : 20} />}
              onClick={() => router.push("/darmasaba/penghargaan")}
              aria-label="Lihat semua penghargaan"
            >
              <Text
                c="white"
                fz={isMobile ? TYPO.body.base : TYPO.body.md}
                fw={700}
                style={{ lineHeight: TYPO.body.lh }}
              >
                Lihat Semua Penghargaan
              </Text>
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* CSS untuk animasi tombol play */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }
      `}</style>
    </Stack>
  );
}

export default Penghargaan;
