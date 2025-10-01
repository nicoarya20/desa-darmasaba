/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import prestasiState from "@/app/admin/(dashboard)/_state/landing-page/prestasi-desa";
import colors from "@/con/colors";
import { BackgroundImage, Box, Button, Center, Container, Group, Loader, SimpleGrid, Stack, Text } from "@mantine/core";
import { useProxy } from "valtio/utils";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconTrophy } from "@tabler/icons-react";

function Prestasi() {
  const state = useProxy(prestasiState.prestasiDesa);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    prestasiState.kategoriPrestasi.findMany.load();
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

  const data = (state.findMany.data || []).slice(0, 3);

  return (
    <Stack p="sm" bg="linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)">
      <Container w={{ base: "100%", md: "80%" }} p="xl">
        <Stack align="center" gap="sm">
          <Group gap="xs">
            <IconTrophy size={36} color={colors["blue-button"]} />
            <Text ta="center" fz={{ base: "2rem", md: "3.4rem" }} fw={700}>
              Prestasi Desa
            </Text>
          </Group>
          <Text fz={{ base: "1rem", md: "1.3rem" }} ta="center" c="dimmed" maw={700}>
            Kami bangga dengan pencapaian desa hingga saat ini. Semoga prestasi ini menjadi inspirasi untuk terus berkarya dan berinovasi demi kemajuan bersama.
          </Text>
          <Button
            radius="xl"
            size="lg"
            variant="gradient"
            gradient={{ from: "#26667F", to: "#124170" }}
            component={Link}
            href="/darmasaba/prestasi-desa"
          >
            Lihat Semua Prestasi
          </Button>
        </Stack>
      </Container>

      <Box py={50}>
        {loading ? (
          <Center mih={200}>
            <Loader color={colors["blue-button"]} size="xl" />
          </Center>
        ) : data.length === 0 ? (
          <Center mih={200}>
            <Stack align="center" gap="xs">
              <IconTrophy size={48} color="gray" />
              <Text fz="1.2rem" fw={500} c="dimmed">
                Belum ada prestasi yang ditampilkan
              </Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {data.map((v, k) => (
              <BackgroundImage
                key={k}
                src={v.image?.link || ""}
                radius="xl"
                pos="relative"
              >
                <Box
                  pos="absolute"
                  inset={0}
                  bg="linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)"
                  style={{ borderRadius: "1rem" }}
                />
                <Stack justify="space-between" h="100%" pos="relative" p="lg">
                  <Box>
                    <Text
                      c="white"
                      fz={{ base: "1rem", md: "1.25rem" }}
                      ta="center"
                      fw={500}
                    >
                      {v.kategori.name}
                    </Text>
                  </Box>
                  <Text
                    fw={700}
                    c="white"
                    fz={{ base: "1.5rem", md: "2rem", lg: "2.5rem" }}
                    ta="center"
                    dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                    style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                    lineClamp={5}
                  />
                  <Group justify="center">
                    <Button
                      onClick={() => router.push(`/darmasaba/prestasi-desa/${v.id}`)}
                      radius="xl"
                      size="md"
                      color={colors["blue-button"]}
                    >
                      Detail Prestasi
                    </Button>
                  </Group>
                </Stack>
              </BackgroundImage>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Stack>
  );
}

export default Prestasi;
