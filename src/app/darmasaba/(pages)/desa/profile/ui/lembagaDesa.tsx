import colors from '@/con/colors';
import { Box, Center, Image, Paper, Stack, Text } from '@mantine/core';

function LembagaDesa() {
  return (
    <Box pb={70}>
      <Stack align='center' gap={0}>
        <Box pb={30}>
          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Lembaga Desa</Text>
          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"h2"}>Badan Permusyawaratan Desa (BPD)</Text>
        </Box>
        <Paper mb={50} p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
          <Center pb={10}>
            <Image src={"/api/img/bpddarmasaba.png"} alt='' w={{ base: 600, md: 1000 }} />
          </Center>
        </Paper>
        <Box pb={30}>
          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Lembaga pemberdayaan Masyarakat (LPM)</Text>
        </Box>
        <Paper mb={50} p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
          <Center pb={10}>
            <Image src={"/api/img/bpddarmasaba.png"} alt='' w={{ base: 600, md: 1000 }} />
          </Center>
        </Paper>
        <Box pb={30}>
          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"2.5rem"}>Perangkat Desa</Text>
          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={"h2"}>Struktur Organisasi Tata Kerja Pemerintahan Desa Darmasaba</Text>
        </Box>
        <Paper mb={50} p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
          <Center pb={10}>
            <Image src={"/api/img/bpddarmasaba.png"} alt='' w={{ base: 600, md: 1000 }} />
          </Center>
        </Paper>
      </Stack>
    </Box >
  );
}

export default LembagaDesa;
