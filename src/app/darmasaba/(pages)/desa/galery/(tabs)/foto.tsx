import colors from '@/con/colors';
import { SimpleGrid, Box, Paper, Center, Stack, Image, Text } from '@mantine/core';
import React from 'react';

const data = [
  {
    id: 1,
    image: "/api/img/galeri-1.png",
    title: "Pendapatan",
    tanggal: "3 Mar 2025",
    judul: "Pemasangan Wifi Gratis Di Publik Desa",

  },
  {
    id: 2,
    image: "/api/img/galeri-2.png",
    title: "Belanja",
    tanggal: "4 Mar 2025",
    judul: "Panen raya Desa Darmasaba",
  },
  {
    id: 3,
    image: "/api/img/galeri-3.png",
    title: "Pembiayaan",
    tanggal: "5 Mar 2025",
    judul: "Kegiatan Pembangunan Pelinggih",
  }
]
function Foto() {
  return (
    <Box pt={20}>
      <SimpleGrid
          cols={{
            base: 1,
            md: 3,
          }}>
          {data.map((v, k) => {
            return (
              <Box key={k}>
                <Paper mb={50} p={"md"} radius={26} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                  <Box>
                    <Center>
                      <Image src={v.image} alt='' />
                    </Center>
                  </Box>
                  <Box>
                    <Stack gap={"sm"} py={10}>
                      <Text fz={{ base: "sm", md: "sm" }}>{v.tanggal}</Text>
                      <Text fw={"bold"} fz={{ base: "sm", md: "sm" }}>{v.judul}</Text>
                      <Text ta={"justify"} fz={{ base: "sm", md: "sm" }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Fusce sagittis nec arcu ac ornare. Praesent a porttitor
                        felis. Proin varius ex nisl, in hendrerit odio tristique vel. </Text>
                    </Stack>
                  </Box>
                </Paper>
              </Box>
            )
          })}
        </SimpleGrid>
    </Box>
  );
}

export default Foto;
