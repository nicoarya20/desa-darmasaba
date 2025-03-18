import colors from '@/con/colors';
import { ActionIcon, BackgroundImage, Box, Container, Flex, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import BackButton from '../../(pages)/desa/layanan/_com/BackButto';

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
  {
    id: 4,
    title: "APBDesa 2025",
    image: "/api/img/apb-des.jpg",
    value: "Rp 500M"
  },
  {
    id: 5,
    title: "APBDesa 2024",
    image: "/api/img/apb-des.jpg",
    value: "Rp 450M"
  },
  {
    id: 6,
    title: "APBDesa 2023",
    image: "/api/img/apb-des.jpg",
    value: "Rp 400M"
  },
]
function Page() {
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={22}>
      <Container w={{ base: "100%", md: "50%" }}>
        <BackButton />
        <Stack align="center" gap={0}>
          <Text fz={"3.4rem"} fw={"bold"}>
            APBDes
          </Text>
          <Text
            py={10}
            ta={"justify"}
          >
            Transparansi APBDes Darmasaba adalah langkah nyata menuju tata kelola pemerintahan desa yang bersih dan bertanggung jawab. Adapun APBDes sebagai berikut:
          </Text>
        </Stack>
      </Container>
      <SimpleGrid
        px={50}
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
    </Stack>
  );
}

export default Page;
