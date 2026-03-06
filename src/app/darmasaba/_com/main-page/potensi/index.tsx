/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import potensiDesaState from "@/app/admin/(dashboard)/_state/desa/potensi";
import colors from "@/con/colors";
import {
  BackgroundImage,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconArrowRight, IconInfoCircle } from "@tabler/icons-react";
import _ from "lodash";
import { motion } from "motion/react";
import { useTransitionRouter } from "next-view-transitions";
import { useEffect, useState } from "react";
import { useProxy } from "valtio/utils";

const textHeading = {
  title: "Potensi Desa",
  des: "Jelajahi berbagai potensi dan peluang yang dimiliki desa. Fitur ini membantu warga maupun pemerintah desa dalam merencanakan dan mengembangkan program berbasis kekuatan lokal.",
};

function Potensi() {
  const router = useTransitionRouter();
  const [loading, setLoading] = useState(false);
  const state = useProxy(potensiDesaState.potensiDesa);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await state.findMany.load();
      } catch (error) {
        console.error("Gagal memuat data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const data = (state.findMany.data || []).slice(0, 4);

  return (
    <Stack p="sm" gap="xl">
      {/* HEADER */}
      <Container w={{ base: "100%", md: "80%" }} p="md">
        <Text
          id="news-title"
          ta="center"
          fw={800}
          c={colors["blue-button"]}
          fz={{ base: "2rem", md: "3.2rem" }}
          lh={{ base: "2.6rem", md: "3.6rem" }}
          style={{ letterSpacing: "-0.5px" }}
        >
          {textHeading.title}
        </Text>

        <Text
          id="news-content"
          ta="center"
          c="gray.7"
          fz={{ base: "1rem", md: "1.25rem" }}
          lh={{ base: "1.5rem", md: "1.9rem" }}
          style={{ marginTop: 8, maxWidth: 800, marginInline: "auto" }}
        >
          {textHeading.des}
        </Text>
      </Container>

      {/* LOADING STATE */}
      {loading ? (
        <Stack align="center" justify="center" h={300}>
          <Loader size="lg" color={colors["blue-button"]} />
          <Text c="gray.4" fz="1rem" lh="1.4rem">
            Sedang memuat potensi desa...
          </Text>
        </Stack>
      ) : data.length === 0 ? (
        <Stack align="center" justify="center" h={300} gap="xs">
          <IconInfoCircle size={48} color={colors["blue-button"]} />
          <Text fw={600} c="gray.3" fz="1.2rem" lh="1.4rem">
            Belum ada potensi tersedia
          </Text>
          <Text fz="0.9rem" lh="1.3rem" c="gray.5">
            Silakan cek kembali nanti untuk pembaruan terbaru.
          </Text>
        </Stack>
      ) : (
        /* CARD LIST */
        <SimpleGrid cols={{ base: 1, sm: 2 }} px={{base: 'md', md: 80}}>
          {_.take(data, 4).map((v, k) => (
            <motion.div
              key={k}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/darmasaba/desa/potensi/${v.id}`)}
              style={{ cursor: "pointer" }}
            >
              <BackgroundImage
                src={v.image?.link}
                h={320}
                radius={20}
                pos="relative"
              >
                <Box
                  pos="absolute"
                  w="100%"
                  h="100%"
                  bg={colors.trans.dark[2]}
                  style={{ borderRadius: 20, zIndex: 0 }}
                />

                {/* CARD CONTENT */}
                <Stack
                  justify="end"
                  h="100%"
                  p="md"
                  align="start"
                  pos="absolute"
                  style={{ zIndex: 1 }}
                >
                  <Tooltip label={v.name} position="top-start">
                    <Text
                      fw={700}
                      c="white"
                      fz={{ base: "1.25rem", md: "1.45rem" }}
                      lh={{ base: "1.6rem", md: "1.8rem" }}
                      truncate
                    >
                      {v.name}
                    </Text>
                  </Tooltip>

                  <Text
                    lineClamp={2}
                    c="gray.2"
                    fz={{ base: "0.85rem", md: "1rem" }}
                    lh={{ base: "1.2rem", md: "1.4rem" }}
                    dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                  />
                </Stack>
              </BackgroundImage>
            </motion.div>
          ))}
        </SimpleGrid>
      )}

      {/* BUTTON */}
      <Stack align="center">
        <Group>
          <Button
            onClick={() => router.push("/darmasaba/desa/potensi")}
            color={colors["blue-button"]}
            variant="gradient"
            gradient={{ from: "#26667F", to: "#124170" }}
            radius="xl"
            size="md"
            rightSection={<IconArrowRight size={18} />}
            style={{ fontWeight: 600 }}
          >
            Lihat Semua Potensi
          </Button>
        </Group>
      </Stack>

      <Divider />
    </Stack>
  );
}

export default Potensi;
