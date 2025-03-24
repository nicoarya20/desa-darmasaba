import colors from '@/con/colors';
import { ActionIcon, BackgroundImage, Box, Button, Flex, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import Link from 'next/link';

const data = [
  {
    id: 1,
    title: "Pendapatan",
    image: "/api/img/pendapatan.jpeg",
    value: "Rp 495M"
  },
  {
    id: 2,
    title: "Belanja",
    image: "/api/img/belanja.jpeg",
    value: "Rp 395M"
  },
  {
    id: 3,
    title: "Pembiayaan",
    image: "/api/img/pembiayaan.jpeg",
    value: "Rp 295M"
  },

]
function Apbdes() {
  const textHeading = {
    title: "APBDes",
    des: "Transparansi APBDes Darmasaba adalah langkah nyata menuju tata kelola pemerintahan desa yang bersih dan bertanggung jawab"
  }
  return (
    <>
      <Stack p={"sm"} gap={"4rem"} bg={colors.Bg}>
        <Box
          w={{
            base: '100%',
            sm: '60%',
          }}
        >
          <Stack gap={0}>
            <Text fz={"4.4rem"} fw={"bold"}>
              {textHeading.title}
            </Text>
            <Text fz={"1.4rem"}>
              {textHeading.des}
            </Text>
          </Stack>
        </Box>
        <SimpleGrid
          cols={{
            base: 1,
            sm: 3,
          }}
        >
          {data.map((v, k) => {
            return (
              <BackgroundImage
                key={k}
                src={v.image}
                h={350}
                radius={16}
                pos={"relative"}
              >
                <Box
                  style={{
                    borderRadius: 16,
                    zIndex: 0
                  }}
                  pos={"absolute"}
                  w={"100%"}
                  h={"100%"}
                  bg={colors.trans.dark[2]}
                />
                <Stack justify='space-between' h={"100%"} gap={0} p={"lg"} pos={"relative"}>
                  <Box p={"lg"}>
                    <Text
                      c={"white"}
                      size={"1.5rem"}
                      style={{
                        textAlign: "center",
                      }}>{v.title}</Text>
                  </Box>
                  <Text
                    fw={"bold"}
                    c={"white"}
                    size={"3.5rem"}
                    style={{
                      textAlign: "center",
                    }}>{v.value}</Text>
                  <Group justify="center">
                  <ActionIcon px={70} py={20} radius={"xl"} size="md" bg={colors["blue-button"]}>
                    <Flex gap={"md"}>
                      <IconDownload size={20} />
                      <Text fz={"sm"} c={"white"}>Download</Text>
                    </Flex>
                  </ActionIcon>
                </Group>
                </Stack>
              </BackgroundImage>
            )
          })}
        </SimpleGrid>
        <Group pb={80} justify='center'>
          <Button component={Link} href="/darmasaba/apbdesa" radius={"lg"} bg={colors["blue-button"]} fz={"h4"}>Lihat Semua</Button>
        </Group>
      </Stack>
    </>
  );
}

export default Apbdes;
