import colors from '@/con/colors';
import { Box, Center, Paper, SimpleGrid, Stack, Text } from '@mantine/core';

const data = [
  {
    id: 1,
    video: "https://www.youtube.com/embed/J2uZcZlvL7g?si=3pWy0ho77dW0E2Gt",
    tanggal: "3 Mar 2025",
    judul: "MENERIMA KUNJUNGAN STUDI TIRU DARI PEMERINTAH DESA TUA SULAWESI SELATAN",

  },
  {
    id: 2,
    video: "https://www.youtube.com/embed/GX4sqS5zAzw?si=rulOAa2Ylbs4_R82",
    tanggal: "4 Mar 2025",
    judul: "Sosialisasi Pengelolaan Sampah di SD NO 3 Desa Darmasaba",
  },
  {
    id: 3,
    video: "https://www.youtube.com/embed/HCY4H6ODmeA?si=0epW8PAtd6Jum90k",
    tanggal: "5 Mar 2025",
    judul: "Posyandu dan Senam Lansia Banjar Gulingan",
  }
]
function Video() {
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
                    <Box style={{ maxWidth: "560px", width: "100%", aspectRatio: "16/9" }}>
                      <iframe style={{ borderRadius: "16px" }} width="100%"
                        height="100%"
                        src={v.video} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"  ></iframe>
                    </Box>
                  </Center>
                </Box>
                <Box>
                  <Stack gap={"sm"} py={10}>
                    <Text fz={{ base: "sm", md: "sm" }}>{v.tanggal}</Text>
                    <Text fw={"bold"} fz={{ base: "sm", md: "sm" }} lineClamp={1}>{v.judul}</Text>
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

export default Video;
