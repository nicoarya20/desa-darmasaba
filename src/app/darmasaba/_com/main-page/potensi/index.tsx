/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import potensiDesaState from "@/app/admin/(dashboard)/_state/desa/potensi";
import colors from "@/con/colors";
import {
  BackgroundImage,
  Box,
  Button,
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
    <Stack p="sm" gap="4rem">
      <Box w={{ base: "100%", sm: "60%" }}>
        <Text fz="4.4rem" fw={700} c={colors["blue-button"]}>
          {textHeading.title}
        </Text>
        <Text size="1.4rem" c="black">
          {textHeading.des}
        </Text>
      </Box>

      {loading ? (
        <Stack align="center" justify="center" h={300}>
          <Loader size="lg" color={colors["blue-button"]} />
          <Text c="gray.4">Sedang memuat potensi desa...</Text>
        </Stack>
      ) : data.length === 0 ? (
        <Stack align="center" justify="center" h={300} gap="xs">
          <IconInfoCircle size={48} color={colors["blue-button"]} />
          <Text fw={600} c="gray.3">
            Belum ada potensi tersedia
          </Text>
          <Text size="sm" c="gray.5">
            Silakan cek kembali nanti untuk pembaruan terbaru.
          </Text>
        </Stack>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {_.take(data, 4).map((v, k) => (
            <motion.div
              key={k}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/darmasaba/desa/potensi/${v.id}`)}
              style={{ cursor: "pointer" }}
            >
              <BackgroundImage src={v.image?.link} h={320} radius={20} pos="relative">
                <Box
                  pos="absolute"
                  w="100%"
                  h="100%"
                  bg={colors.trans.dark[2]}
                  style={{ borderRadius: 20, zIndex: 0 }}
                />
                <Stack
                  justify="end"
                  h="100%"
                  p="md"
                  align="start"
                  pos="absolute"
                  style={{ zIndex: 1 }}
                >
                  <Tooltip label={v.name} position="top-start">
                    <Text fw={700} c="white" size="2.2rem" truncate>
                      {v.name}
                    </Text>
                  </Tooltip>
                  <Text lineClamp={2} c="gray.2" size="sm">
                    {v.deskripsi}
                  </Text>
                </Stack>
              </BackgroundImage>
            </motion.div>
          ))}
        </SimpleGrid>
      )}

      <Stack align="center">
        <Group>
          <Button
            onClick={() => router.push("/darmasaba/desa/potensi")}
            color={colors["blue-button"]}
            variant="gradient"
            gradient={{ from: "#26667F", to: "#124170", }}
            radius="xl"
            size="md"
            rightSection={<IconArrowRight size={18} />}
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
