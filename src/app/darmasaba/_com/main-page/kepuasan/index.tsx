"use client";
import colors from "@/con/colors";
import { BarChart, PieChart } from '@mantine/charts';
import { Box, Center, Container, Flex, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

const dataBarChart = [
  {
    bulan: "Januari",
    responden: "480"
  },
  {
    bulan: "Februari",
    responden: "730"
  },
  {
    bulan: "Maret",
    responden: "740"
  },
  {
    bulan: "April",
    responden: "80"
  },
  {
    bulan: "Mei",
    responden: "250"
  },
  {
    bulan: "Juni",
    responden: "900"
  },
  {
    bulan: "Juli",
    responden: "230"
  },
  {
    bulan: "Agustus",
    responden: "255"
  },
  {
    bulan: "September",
    responden: "650"
  },
  {
    bulan: "Oktober",
    responden: "730"
  },
  {
    bulan: "November",
    responden: "800"
  },
  {
    bulan: "Desember",
    responden: "1000"
  },

]

const dataPieChart = [
  { name: "Laki-laki", value: 70, color: colors["blue-button"] },
  { name: "Perempuan", value: 30, color: colors.orange },
]

const dataPieChart2 = [
  { name: "Sangat Baik", value: 75, color: colors["blue-button"] },
  { name: "Buruk", value: 25, color: colors.orange },
]

const dataPieChart3 = [
  { name: "Umur 18-44", value: 65, color: colors["blue-button"] },
  { name: "Umur 44-60+", value: 35, color: colors.orange },
]

function Kepuasan() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <Stack p={"sm"}>
      <Container w={{ base: "100%", md: "80%" }} p={"xl"}>
        <Center>
          <Text ta={"center"} fz={{base: "2.4rem", md: "3.4rem"}}>Indeks Kepuasan Masyarakat</Text>
        </Center>
        <Text fz={{base: "1.2rem", md: "1.4rem"}} ta={"center"}>Ukur kebahagiaan warga, tingkatkan layanan desa! Dengan partisipasi aktif masyarakat, kami berkomitmen untuk terus memperbaiki layanan agar lebih transparan, efektif, dan sesuai dengan kebutuhan warga. Kepuasan Anda adalah prioritas utama kami dalam membangun desa yang lebih baik!</Text>
      </Container>
      <Box px={"xl"}>
        <Paper p={"lg"} bg={colors.Bg}>
          <Paper p={"lg"}>
            <Flex justify={"space-between"} align={"center"}>
              <Text fw={"bold"}>Pelayanan Terhadap Publik Desa Darmasaba</Text>
              <Box>
                <Text fz={"h1"} fw={"bold"} c={colors["blue-button"]}>95.00</Text>
                <Text >Sangat Baik</Text>
                <Text fz={"sm"} fw={"bold"} c={colors["blue-button"]}>Total 2500 responden</Text>
              </Box>
            </Flex>
            <BarChart
              py={"xl"}
              h={300}
              data={dataBarChart}
              dataKey="bulan"
              tickLine="y"
              series={[
                {
                  name: "responden",
                  color: colors["blue-button"],
                },
              ]}
            />
          </Paper>
          <Box py={"xl"}>
            <SimpleGrid
              cols={{
                base: 1,
                md: 1,
                lg: 1,
                xl: 3
              }}
            >
              <Box>
                <Paper p={"lg"}>
                  <Text fw={"bold"}>Jenis Kelamin</Text>
                  <Box py={"xl"}>
                    <PieChart
                      size={isMobile ? 100 : 220}
                      withLabelsLine
                      labelsPosition="outside"
                      labelsType="percent"
                      withLabels
                      data={dataPieChart}
                      withTooltip tooltipDataSource="segment" mx="auto"

                    />
                  </Box>
                </Paper>
              </Box>
              <Box>
                <Paper p={"lg"}>
                  <Text fw={"bold"}>Pilihan</Text>
                  <Box py={"xl"}>
                    <PieChart
                      size={isMobile ? 100 : 220}
                      withLabelsLine
                      labelsPosition="outside"
                      labelsType="percent"
                      withLabels
                      data={dataPieChart2}
                      withTooltip tooltipDataSource="segment" mx="auto"

                    />
                  </Box>
                </Paper>
              </Box>
              <Box>
                <Paper p={"lg"}>
                  <Text fw={"bold"}>Umur</Text>
                  <Box py={"xl"}>
                    <PieChart
                      size={isMobile ? 100 : 220}
                      withLabelsLine
                      labelsPosition="outside"
                      labelsType="percent"
                      withLabels
                      data={dataPieChart3}
                      withTooltip tooltipDataSource="segment" mx="auto"
                    />
                  </Box>
                </Paper>
              </Box>
            </SimpleGrid>

          </Box>
        </Paper>
      </Box>
    </Stack>
  );
}

export default Kepuasan;
