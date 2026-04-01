/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import prestasiState from "@/app/admin/(dashboard)/_state/landing-page/prestasi-desa";
import colors from "@/con/colors";
import {
  BackgroundImage,
  Box,
  Button,
  Center,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProxy } from "valtio/utils";

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
          
          {/* TITLE UTAMA */}
          <Title
            order={1}
            c={colors["blue-button"]}
            ta="center"
            fz={{ base: "2rem", sm: "2.6rem", md: "3.2rem" }}
            lh={{ base: "2.4rem", md: "3.5rem" }}
          >
            Prestasi Desa
          </Title>

          {/* SUBTEXT */}
          <Text
            fz={{ base: "1rem", md: "1.2rem" }}
            lh={{ base: "1.5rem", md: "1.8rem" }}
            ta="center"
            c="black"
            maw={700}
          >
            Kami bangga dengan pencapaian desa hingga saat ini. Semoga prestasi ini
            menjadi inspirasi untuk terus berkarya dan berinovasi demi kemajuan
            bersama.
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

      <Box py="lg">
        {loading ? (
          <Center mih={200}>
            <Loader color={colors["blue-button"]} size="xl" />
          </Center>
        ) : data.length === 0 ? (
          <Center mih={200}>
            <Stack align="center" gap="xs">
              <Text fz="1.2rem" fw={500} c="dimmed" ta="center" lh="1.4rem">
                Belum ada prestasi yang ditampilkan
              </Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mb="xl">
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
                  style={{ borderRadius: 27 }}
                />

                <Stack justify="space-between" h="100%" pos="relative" p="lg">
                  
                  {/* KATEGORI */}
                  <Text
                    c="white"
                    fz={{ base: "1rem", md: "1.15rem" }}
                    lh={{ base: "1.4rem", md: "1.6rem" }}
                    ta="center"
                    fw={500}
                  >
                    {v.kategori.name}
                  </Text>

                  {/* DESKRIPSI */}
                  <Text
                    fw={700}
                    c="white"
                    fz={{ base: "1.4rem", md: "1.8rem", lg: "2.2rem" }}
                    lh={{ base: "1.8rem", md: "2.2rem", lg: "2.6rem" }}
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
