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
import { useRouter } from "next/navigation";
import useSWR from "swr";

const datamap = [
  {
    id: 1,
    images: "/api/img/tps.png",
    name: "TPS3R Pudak Mesari",
    deskripsi: "TPS 3R Pudak Mesari Darmasaba layak mendapat penghargaan demikian apresiasi dari Delterra Sosial Indonesia nie Semeton Darmasaba!, Hal tersebut dikarenakan walaupun baru berdiri namun TPS 3R kebanggaan Desa Darmasaba tersebut sudah berjalan dengan sangat baik. ",
    link: "/darmasaba/desa/potensi/tps"
  },
  {
    id: 2,
    images: "/api/img/ack.png",
    name: "Bumdes Pudak Mesari",
    deskripsi: "Bumdes Pudak Mesari sangat membantu warga desa Darmasaba dalam mengelola dan membangun sebuah desa yang lebih baik lagi",
    link: "/darmasaba/desa/potensi/bumdes"
  },
  {
    id: 3,
    images: "/api/img/taman-beji.jpg",
    name: "Taman Beji Cengana",
    deskripsi: "Tirta Klebutan di Pura Taman Beji Cengana di Desa Adat Darmasaba, Badung, selain dipercaya nunas Taksu serta pembersihan diri. Tersemat juga asal usul cerita ditemukannya Tirta Klebutan yang tepat berada di pinggir Tukad Cengana tersebut.",
    link: "/darmasaba/desa/potensi/taman"
  },
  {
    id: 4,
    images: "/api/img/waterpark.png",
    name: "Gumuh Sari Water Park",
    deskripsi: "Gumuh Sari Rekreasi atau waterpark, tempat wisata yang asyik dan seru untuk kamu sekeluarga! Tempat liburan di Bali memang seakan nggak ada habisnya. Selalu ada aja destinasi wisata seru yang bisa jadi wishlist. Ada banyak banget tempat wisata yang kamu kunjungi di Bali, mulai dari wisata alam, wisata modern, sampai wisata air.",
    link: "/darmasaba/desa/potensi/gumuh"
  },
]



const textHeading = {
  title: "Potensi",
  des: "Tidak hanya untuk warga desa, fitur ini juga dapat digunakan oleh pemerintah desa untuk merencanakan program pengembangan berbasis potensi lokal",
};

function Potensi() {
  const router = useRouter()
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
            onClick={() => router.push(datamap[k].link)}
          >
            <BackgroundImage
              src={datamap[k].images}
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
                  {datamap[k].name}
                </Text>
                <Text
                  lineClamp={2}
                  style={{
                    textAlign: "justify",
                  }}
                  c={colors["white-1"]}
                >
                  {datamap[k].deskripsi}
                </Text>
              </Stack>
            </BackgroundImage>
          </motion.div>
        ))}
      </SimpleGrid>
      <Stack align="center">
        <Group>
          <Button onClick={() => router.push("/darmasaba/desa/potensi")} color={colors["blue-button"]} variant="outline" radius={100} size="md">
            Selengkapnya
          </Button>
        </Group>
      </Stack>
      <Divider />
    </Stack>
  );
}

export default Potensi;
