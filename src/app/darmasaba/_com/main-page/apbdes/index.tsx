import colors from '@/con/colors';
import { BackgroundImage, Box, Button, Group, SimpleGrid, Stack, Text } from '@mantine/core';

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
      <Stack p={"sm"} gap={"4rem"} >
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
                    <Button px={46} radius={"100"} size="md" bg={colors["blue-button"]}>
                      Detail
                    </Button>
                  </Group>
                </Stack>
              </BackgroundImage>
            )
          })}
        </SimpleGrid>
      </Stack>
    </>
  );
}

export default Apbdes;
