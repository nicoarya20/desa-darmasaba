import colors from '@/con/colors';
import { ActionIcon, Box, Flex, Paper, SimpleGrid, Stack, Text } from '@mantine/core';

const dataText = [
  {
    id: 1,
    title: "SANTUN",
    description: "Memberikan pelayanan yang baik, penuh rasa empati, sopan, dan beretika"
  },
  {
    id: 2,
    title: "ADAPTIF",
    description: "Cepat menyesuaikan diri menghadapi perubahan dan bertindak proaktif"
  },
  {
    id: 3,
    title: "INOVATIF",
    description: "Selalu berusaha menciptakan pembaruan atau kreasi baru"
  },
  {
    id: 4,
    title: "PROFESIONAL",
    description: "Memiliki pengetahuan, terampil dan bertanggung jawab"
  },
  {
    id: 5,
    title: "GESIT",
    description: "Inisiatif dan cekatan dalam bekerja"
  },
]
function MotoDesa() {
  return (
    <Box pb={70}>
      <Stack align='center' gap={0} >
        <Box pb={30}>
          <Text c={colors['blue-button']} ta={"center"} fw={"bold"} fz={{ base: "h1", md: "2.5rem" }}>Moto Desa Darmasaba</Text>
        </Box>
        <Flex gap={50} pb={50} pt={20} justify={"space-evenly"} align={"center"} >
          <ActionIcon bg={colors['blue-button']} radius={150} p={{ base: "lg", md: "xl" }}>
            <Text c={colors['white-1']} ta={"center"} fw={"bold"} fz={{ base: "h2", md: "h1" }}>S</Text>
          </ActionIcon>
          <ActionIcon bg={colors['blue-button']} radius={150} p={{ base: "lg", md: "xl" }}>
            <Text c={colors['white-1']} ta={"center"} fw={"bold"} fz={{ base: "h2", md: "h1" }}>I</Text>
          </ActionIcon>
          <ActionIcon bg={colors['blue-button']} radius={150} p={{ base: "lg", md: "xl" }}>
            <Text c={colors['white-1']} ta={"center"} fw={"bold"} fz={{ base: "h2", md: "h1" }}>G</Text>
          </ActionIcon>
          <ActionIcon bg={colors['blue-button']} radius={150} p={{ base: "lg", md: "xl" }}>
            <Text c={colors['white-1']} ta={"center"} fw={"bold"} fz={{ base: "h2", md: "h1" }}>A</Text>
          </ActionIcon>
          <ActionIcon bg={colors['blue-button']} radius={150} p={{ base: "lg", md: "xl" }}>
            <Text c={colors['white-1']} ta={"center"} fw={"bold"} fz={{ base: "h2", md: "h1" }}>P</Text>
          </ActionIcon>
        </Flex>
        <Paper mb={50} p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
          <SimpleGrid
            cols={{
              base: 1,
              md: 2,
            }}
          >
            {dataText.map((v, k) => {
              return (
                <Box key={k}>
                  <Text fw={"bold"} fz={{ base: "lg", md: "h3" }}>{v.title}</Text>
                  <Text fz={{ base: "sm", md: "md" }}>{v.description}</Text>
                </Box>
              )
            })}
          </SimpleGrid>
        </Paper>
        <Text mb={40} c={colors['blue-button']} ta={"center"} fw={"bold"} fz={{ base: "h4", md: "h3" }}>&quot;Berkomitmen memberikan pelayanan terbaik dengan prinsip SIGAP untuk masyarakat Desa Darmasaba&quot;</Text>
      </Stack>
    </Box>
  );
}

export default MotoDesa;
