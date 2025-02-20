'use client';
import { Stack, Box, Container, Button, Text } from "@mantine/core";
import { useTransitionRouter } from 'next-view-transitions'

function Penghargaan() {
  const router = useTransitionRouter()
  return (
    <Stack pos={"relative"} h={720}>
      <video
        width="320"
        height="240"
        loop
        autoPlay
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          overflow: "hidden",
        }}
      >
        <source src="/assets/videos/award.mp4" type="video/mp4" />
      </video>
      <Box
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          background: "rgba(0,0,0,0.6)",
        }}
      >
        <Container w={{ base: "100%", md: "80%" }} p={"xl"} h={720}>
          <Stack justify="center" align="center">
            <Text
              style={{
                textAlign: "center",
              }}
              fw={"bold"}
              fz={"2.4rem"}
              c={"white"}
            >
              Penghargaan
            </Text>
            <Stack align="center" gap={0}>
              <Text fz={"1.4rem"} c={"white"}>
                Juara 2 Lomba Video Pendek
              </Text>
              <Text fz={"1.4rem"} c={"white"}>
                Juara 2 Duta Investasi
              </Text>
              <Text fz={"1.4rem"} c={"white"}>
                Juara Favorit Lomba Video Pendek
              </Text>
            </Stack>
            <Button onClick={() => router.push("/penghargaan")} variant="white" radius={100}>
              Selanjutnya
            </Button>
          </Stack>
        </Container>
      </Box>
    </Stack>
  );
}

export default Penghargaan;