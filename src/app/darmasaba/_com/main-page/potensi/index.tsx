/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import potensiDesaState from "@/app/admin/(dashboard)/_state/desa/potensi";
import colors from "@/con/colors";
import {
  BackgroundImage,
  Box,
  Button,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text
} from "@mantine/core";
import _ from "lodash";
import { motion } from "motion/react";
import { useTransitionRouter } from "next-view-transitions";
import { useEffect, useState } from "react";
import { useProxy } from "valtio/utils";



const textHeading = {
  title: "Potensi",
  des: "Tidak hanya untuk warga desa, fitur ini juga dapat digunakan oleh pemerintah desa untuk merencanakan program pengembangan berbasis potensi lokal",
};

function Potensi() {
  const router = useTransitionRouter()
  const [loading, setLoading] = useState(false)
  const state = useProxy(potensiDesaState.potensiDesa)

  useEffect(()=> {
    const loadData = async () => {
      try {
        setLoading(true);
        await state.findMany.load()
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData()
  }, [])

  const data = (state.findMany.data || []).slice(0, 4);
  return (
    <Stack p={"sm"} gap={"4rem"}>
      <Box
        w={{
          base: "100%",
          sm: "60%",
        }}
      >
        <Text fz={"4.4rem"}>{textHeading.title}</Text>
        <Text size={"1.4rem"}>{textHeading.des}</Text>
      </Box>
      <SimpleGrid
        cols={{
          base: 1,
          sm: 2,
        }}
      >
        {_.take(data, 4).map((v, k) => (
          <motion.div
            key={k}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => router.push(`/darmasaba/desa/potensi/${v.id}`)}
          >
            <BackgroundImage
              src={v.image?.link}
              h={320}
              key={k}
              radius={16}
              pos={"relative"}
            >
              <Box
                style={{
                  borderRadius: 16,
                  zIndex: 0,
                }}
                pos={"absolute"}
                w={"100%"}
                h={"100%"}
                bg={colors.trans.dark[2]}
              />
              <Stack
                justify="end"
                h={"100%"}
                p={"md"}
                align="start"
                pos={"absolute"}
                style={{
                  zIndex: 1,
                }}
              >
                <Text fw={"bold"} c={"gray.1"} size={"2.4rem"}>
                  {v.name}
                </Text>
                <Text
                  lineClamp={2}
                  style={{
                    textAlign: "justify",
                  }}
                  c={colors["white-1"]}
                >
                  {v.deskripsi}
                </Text>
              </Stack>
            </BackgroundImage>
          </motion.div>
        ))}
      </SimpleGrid>
      <Stack align="center">
        <Group>
          <Button onClick={()=> router.push("/darmasaba/desa/potensi")} color={colors["blue-button"]} variant="outline" radius={100} size="md">
            Selengkapnya
          </Button>
        </Group>
      </Stack>
      <Divider />
    </Stack>
  );
}

export default Potensi;
