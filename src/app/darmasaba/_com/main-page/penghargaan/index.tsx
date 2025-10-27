/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import penghargaanState from "@/app/admin/(dashboard)/_state/desa/penghargaan";
import { Stack, Box, Container, Button, Text, Loader, Paper } from "@mantine/core";
import { IconAward, IconArrowRight } from "@tabler/icons-react";
import { useTransitionRouter } from 'next-view-transitions';
import { useEffect, useState } from "react";
import { useProxy } from "valtio/utils";
import { useMediaQuery } from "@mantine/hooks";

function Penghargaan() {
  const router = useTransitionRouter();
  const state = useProxy(penghargaanState);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

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

  // kalau mobile ambil 1 data aja, kalau desktop ambil 3
  const data = state.findMany.data?.slice(0, isMobile ? 1 : 3);

  return (
    <Stack pos="relative" h="auto" mih={{ base: 500, md: 720 }}>
      <video
        loop
        autoPlay
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      >
        <source src="/assets/videos/award.mp4" type="video/mp4" />
      </video>

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
