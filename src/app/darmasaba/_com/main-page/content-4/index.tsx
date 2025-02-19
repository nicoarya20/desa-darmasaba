/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import colors from "@/con/colors";
import images from "@/con/images";
import ApiFetch from "@/lib/api-fetch";
import {
  BackgroundImage,
  Box,
  Button,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import _ from "lodash";
import { motion } from "motion/react";
import useSWR from "swr";

type DataPotensi = {
  id: string;
  name: string;
};

const textHeading = {
  title: "Potensi",
  des: "segenap sumber daya alam dan sumber daya manusia yang dimiliki desa sebagai modal dasar yang perlu dikelola dan dikembangkan bagi kelangsungan dan perkembangan desa",
};

function Content4() {
  const { data, isLoading } = useSWR("/", (url) =>
    ApiFetch.api.potensi.get().then(({ data }) => data?.data)
  );
  if (isLoading) return <Text>loading ...</Text>;
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
          >
            <BackgroundImage
              src={images.tps}
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
                  style={{
                    textAlign: "center",
                  }}
                  c={"blue"}
                >
                  Tambahkan Text Indikasi Keberhasilan
                </Text>
              </Stack>
            </BackgroundImage>
          </motion.div>
        ))}
      </SimpleGrid>
      <Stack align="center">
        <Group>
          <Stack gap={0}>
            <Title>Text Lanjutan Mengarahkan</Title>
            <Text
              style={{
                textAlign: "center",
              }}
            >
              deskripsi singkat sebelum tombol dibawah setelah ini
            </Text>
          </Stack>
        </Group>
        <Group>
          <Button variant="outline" radius={100} size="md">
            Selanjutnya
          </Button>
        </Group>
      </Stack>
      <Divider />
    </Stack>
  );
}

export default Content4;
