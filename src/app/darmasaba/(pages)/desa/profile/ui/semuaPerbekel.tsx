'use client'
import colors from '@/con/colors';
import { Box, Center, Image, Paper, SimpleGrid, Stack, Text } from '@mantine/core';

const data = [
  {
    id: 1,
    nama: "SI GEDE KANIA",
    wilayah: "PERBEKEL TEGAL",
    periode: "Tahun 1943 - 1946",
    foto: "/api/img/perbekel-1.png"
  },
  {
    id: 2,
    nama: "SI GEDE GANDEM",
    wilayah: "PERBEKEL TEGAL",
    periode: "Tahun 1946 - 1950",
    foto: "/api/img/perbekel-2.png"
  },
  {
    id: 3,
    nama: "I WAYAN SAMA",
    wilayah: "PERBEKEL TEGAL",
    periode: "Tahun 1950 - 1953",
    foto: "/api/img/perbekel-3.png"
  },
  {
    id: 4,
    nama: "I WAYAN NAMBREG",
    wilayah: "PERBEKEL DARMASABA",
    periode: "Tahun 1950 - 1960",
    foto: "/api/img/perbekel-4.png"
  },
  {
    id: 5,
    nama: "IDA BAGUS PUTU OKA",
    wilayah: "PERBEKEL TEGAL/DARMASABA",
    periode: "Tahun 1953 - 1974",
    foto: "/api/img/perbekel-5.png"
  },
  {
    id: 6,
    nama: "I NYOMAN PATRA",
    wilayah: "PERBEKEL DARMASABA",
    periode: "Tahun 1974 - 1991",
    foto: "/api/img/perbekel-6.png"
  },
  {
    id: 7,
    nama: "I MADE RUDJA",
    wilayah: "PERBEKEL DARMASABA",
    periode: "Tahun 1991 - 2007",
    foto: "/api/img/perbekel-7.png"
  },
  {
    id: 8,
    nama: "I WAYAN KALER, SH.MH.",
    wilayah: "PERBEKEL DARMASABA",
    periode: "Tahun 2007 - 2013",
    foto: "/api/img/perbekel-8.png"
  },
  {
    id: 9,
    nama: "I MADE TARAM, SH.",
    wilayah: "PERBEKEL DARMASABA",
    periode: "Tahun 2013 - 2019",
    foto: "/api/img/perbekel-9.png"
  },
]
function SemuaPerbekel() {

  return (
    <Box pb={50}>
      <Stack align='center'>
        <Box pb={30}>
          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={{ base: "h1", md: "2.5rem" }}>Perbekel Dari Masa Ke Masa</Text>
        </Box>
        <SimpleGrid
          cols={{
            base: 1,
            md: 3,
          }}
        >
          {data.map((v, k) => {
            return (
              <Box key={k}>
                <Paper mb={50} radius={26} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                  <Box>
                    <Center>
                      <Image src={v.foto} alt='' />
                    </Center>
                  </Box>
                  <Box>
                    <Stack gap={"sm"} py={10}>
                      <Text ta={"center"} fw={"bold"} fz={{ base: "h3", md: "h3" }}>{v.nama}</Text>
                      <Text ta={"center"} fz={{ base: "h5", md: "h4" }}>{v.wilayah}</Text>
                      <Text ta={"center"} fz={{ base: "h5", md: "h4" }}>{v.periode}</Text>
                    </Stack>
                  </Box>
                </Paper>
              </Box>
            )
          })
          }
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default SemuaPerbekel;
