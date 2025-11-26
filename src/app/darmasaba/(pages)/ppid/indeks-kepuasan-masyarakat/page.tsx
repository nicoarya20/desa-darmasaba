/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import indeksKepuasanState from "@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan";
import colors from "@/con/colors";
import { BarChart, PieChart } from '@mantine/charts';
import { Box, Button, Center, Container, Flex, Modal, Paper, Select, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from "@mantine/core";
import { useDisclosure, useShallowEffect } from "@mantine/hooks";
import { useState } from "react";
import { useProxy } from "valtio/utils";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  label?: string;
}



function Kepuasan() {
const state = useProxy(indeksKepuasanState.responden);
  const { data, loading } = state.findMany;
  const [donutDataJenisKelamin, setDonutDataJenisKelamin] = useState<ChartDataItem[]>([]);
  const [donutDataRating, setDonutDataRating] = useState<ChartDataItem[]>([]);
  const [donutDataKelompokUmur, setDonutDataKelompokUmur] = useState<ChartDataItem[]>([]);
  const [barChartData, setBarChartData] = useState<Array<{ month: string; Responden: number }>>([]);
  const [opened, { open, close }] = useDisclosure(false)

  const resetForm = () => {
    state.create.form = {
      ...state.create.form,
      name: "",
      tanggal: "",
      jenisKelaminId: "",
      ratingId: "",
      kelompokUmurId: "",
    }
  }

  useShallowEffect(() => {
    indeksKepuasanState.jenisKelaminResponden.findMany.load()
    indeksKepuasanState.pilihanRatingResponden.findMany.load()
    indeksKepuasanState.kelompokUmurResponden.findMany.load()
  },[])

  const handleSubmit = async () => {
    try {
      const id = await state.create.create();
      if (typeof id !== 'undefined') {
        const idStr = String(id);
        await state.findUnique.load(idStr);
      }
      resetForm();
      close()
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  }

  // Load data on component mount
  useShallowEffect(() => {
    if (!data && !loading) {
      state.findMany.load(1, 1000); // Load first page with a large limit to get all data
      return;
    }

    if (data && data.length > 0) {
      // Hitung total berdasarkan jenis kelamin
      const totalLaki = data.filter((item: any) => item.jenisKelamin?.name?.toLowerCase() === 'laki-laki').length;
      const totalPerempuan = data.filter((item: any) => item.jenisKelamin?.name?.toLowerCase() === 'perempuan').length;

      // Hitung total berdasarkan rating
      const totalSangatBaik = data.filter((item: any) => item.rating?.name?.toLowerCase() === 'sangat baik').length;
      const totalBaik = data.filter((item: any) => item.rating?.name?.toLowerCase() === 'baik').length;
      const totalKurangBaik = data.filter((item: any) => item.rating?.name?.toLowerCase() === 'kurang baik').length;
      const totalSangatKurangBaik = data.filter((item: any) => item.rating?.name?.toLowerCase() === 'sangat kurang baik').length;

      // Hitung total berdasarkan kelompok umur
      const totalMuda = data.filter((item: any) => item.kelompokUmur?.name?.toLowerCase() === 'muda').length;
      const totalDewasa = data.filter((item: any) => item.kelompokUmur?.name?.toLowerCase() === 'dewasa').length;
      const totalLansia = data.filter((item: any) => item.kelompokUmur?.name?.toLowerCase() === 'lansia').length;

      // Update gender chart data
      setDonutDataJenisKelamin([
        { name: 'Laki-laki', value: totalLaki, color: colors['blue-button'] },
        { name: 'Perempuan', value: totalPerempuan, color: '#10A85AFF' },
      ]);

      // Update rating chart data
      setDonutDataRating([
        { name: 'Sangat Baik', value: totalSangatBaik, color: colors['blue-button'] },
        { name: 'Baik', value: totalBaik, color: '#10A85AFF' },
        { name: 'Kurang Baik', value: totalKurangBaik, color: '#FFA500' },
        { name: 'Sangat Kurang Baik', value: totalSangatKurangBaik, color: '#FF4500' },
      ]);

      // Update age group chart data
      setDonutDataKelompokUmur([
        { name: 'Muda', value: totalMuda, color: colors['blue-button'] },
        { name: 'Dewasa', value: totalDewasa, color: '#10A85AFF' },
        { name: 'Lansia', value: totalLansia, color: '#FFA500' },
      ]);

      // Process data for bar chart (group by month)
      const monthYearMap = new Map<string, number>();

      data.forEach((item: any) => {
        // Try both createdAt and tanggal fields
        const dateValue = item.tanggal || item.createdAt;
        if (!dateValue) return;

        const parsedDate = new Date(dateValue);
        if (isNaN(parsedDate.getTime())) return;

        const month = parsedDate.getMonth() + 1;
        const year = parsedDate.getFullYear();
        const monthYearKey = `${year}-${String(month).padStart(2, '0')}`;

        monthYearMap.set(monthYearKey, (monthYearMap.get(monthYearKey) || 0) + 1);
      });

      // Convert map to array and sort by date
      const barData = Array.from(monthYearMap.entries())
        .map(([key, Responden]) => {
          const [year, month] = key.split('-');
          const monthName = new Date(Number(year), Number(month) - 1, 1)
            .toLocaleString('id-ID', { month: 'long' });
          return {
            month: `${monthName} ${year}`,
            Responden,
            sortKey: parseInt(`${year}${String(month).padStart(2, '0')}`, 10)
          };
        })
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(({ month, Responden }) => ({ month, Responden }));

      setBarChartData(barData);
    }
  }, [data]);

  if ((loading && !data) || !data) {
    return (
      <Stack py={10} px="xl">
        <Skeleton height={300} mb="md" />
        <SimpleGrid cols={{ base: 1, md: 3 }}>
          <Skeleton height={300} />
          <Skeleton height={300} />
          <Skeleton height={300} />
        </SimpleGrid>
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Stack p="sm">
        <Container w={{ base: "100%", md: "80%" }} p={"xl"}>
          <Center>
          <Text fw={"bold"} fz={{ base: "1.8rem", md: "3.4rem" }}>Indeks Kepuasan Masyarakat</Text>
          </Center>
          <Text ta={"center"} fz={{ base: "1rem", md: "1.3rem" }}>Ukur kebahagiaan warga, tingkatkan layanan desa! Dengan partisipasi aktif masyarakat, kami berkomitmen untuk terus memperbaiki layanan agar lebih transparan, efektif, dan sesuai dengan kebutuhan warga. Kepuasan Anda adalah prioritas utama kami dalam membangun desa yang lebih baik!</Text>
          <Center mt={10}>
            <Button
              radius={"lg"}
              onClick={open}
              variant="gradient"
              gradient={{ from: "#26667F", to: "#124170" }}
            >Ajukan Responden</Button>
          </Center>
        </Container>
        <Box px={"xl"}>
          <Paper p={"lg"} bg={colors.Bg}>
            <Paper p={"lg"}>
              <Stack gap={"xs"}>
                <Flex justify={"space-between"} align={"center"}>
                  <Text fw={"bold"}>Pelayanan Terhadap Publik Desa Darmasaba</Text>
                  <Box>
                    <Text fz={"sm"} fw={"bold"} c={colors["blue-button"]}>Total Responden</Text>
                    <Text ta={"end"} fz={"h1"} fw={"bold"} c={colors["blue-button"]}>
                      {state.findMany.total.toLocaleString('id-ID')}
                    </Text>
                  </Box>
                </Flex>
                <BarChart
                  h={window.innerWidth < 480 ? 200 : 300}
                  data={barChartData}
                  dataKey="month"
                  series={[{ name: 'Responden', color: colors['blue-button'] }]}
                  tickLine="y"
                  xAxisLabel="Bulan"
                  yAxisLabel="Jumlah Responden"
                  withTooltip
                  tooltipAnimationDuration={200}
                />
              </Stack>
            </Paper>
            <Box py={"xl"}>
              <SimpleGrid
                cols={{ base: 1, sm: 2, lg: 3 }}
                spacing="md"
                verticalSpacing="md"
              >
                {/* Chart Jenis Kelamin */}
                <Paper bg={colors['white-1']} p="md" radius="md">
                  <Stack>
                    <Title order={4}>Jenis Kelamin</Title>
                    {donutDataJenisKelamin.every(item => item.value === 0) ? (
                      <Text c="dimmed" ta="center" my="md">
                        Belum ada data untuk ditampilkan dalam grafik
                      </Text>
                    ) : (
                      <Paper p="md" radius="md" withBorder>
                        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box style={{ position: 'relative', width: '100%' }}>
                            <Center>
                              <PieChart
                                withLabels
                                withTooltip
                                labelsType="percent"
                                size={250} // Fixed size in pixels
                                data={donutDataJenisKelamin}
                              />
                            </Center>
                          </Box>
                          <Stack gap="sm" mt="md">
                            {donutDataJenisKelamin.map((entry) => (
                              <Flex key={entry.name} gap="md" align="center">
                                <Box bg={entry.color} w={20} h={20} style={{ flexShrink: 0 }} />
                                <Text size="sm">{entry.name}: {entry.value}</Text>
                              </Flex>
                            ))}
                          </Stack>
                        </Box>
                      </Paper>
                    )}
                  </Stack>
                </Paper>

                {/* Chart Rating */}
                <Paper bg={colors['white-1']} p="md" radius="md">
                  <Stack>
                    <Title order={4}>Ulasan</Title>
                    {donutDataRating.every(item => item.value === 0) ? (
                      <Text c="dimmed" ta="center" my="md">
                        Belum ada data untuk ditampilkan dalam grafik
                      </Text>
                    ) : (
                      <Paper p="md" radius="md" withBorder>
                        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box style={{ position: 'relative', width: '100%' }}>
                            <Center>
                              <PieChart
                                withTooltip
                                tooltipAnimationDuration={200}
                                withLabels
                                labelsPosition="outside"
                                labelsType="percent"
                                withLabelsLine
                                size={250}
                                data={donutDataRating}
                              />
                            </Center>
                          </Box>
                          <Box mt="md" style={{ width: '100%' }}>
                            <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
                              {donutDataRating.map((entry) => (
                                <Flex key={entry.name} gap="sm" align="center" style={{ overflow: 'hidden' }}>
                                  <Box bg={entry.color} w={16} h={16} style={{ flexShrink: 0 }} />
                                  <Text size="xs" lineClamp={1} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {entry.name}: {entry.value}
                                  </Text>
                                </Flex>
                              ))}
                            </SimpleGrid>
                          </Box>
                        </Box>
                      </Paper>
                    )}
                  </Stack>
                </Paper>

                {/* Chart Kelompok Umur */}
                <Paper bg={colors['white-1']} p="md" radius="md">
                  <Stack>
                    <Title order={4}>Umur</Title>
                    {donutDataKelompokUmur.every(item => item.value === 0) ? (
                      <Text c="dimmed" ta="center" my="md">
                        Belum ada data untuk ditampilkan dalam grafik
                      </Text>
                    ) : (
                      <Paper p="md" radius="md" withBorder>
                        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box style={{ position: 'relative', width: '100%' }}>
                            <Center>
                              <PieChart
                                withTooltip
                                tooltipAnimationDuration={200}
                                withLabels
                                labelsPosition="outside"
                                labelsType="percent"
                                withLabelsLine
                                size={250}
                                data={donutDataKelompokUmur}
                              />
                            </Center>
                          </Box>
                          <Box mt="md" style={{ width: '100%' }}>
                            <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
                              {donutDataKelompokUmur.map((entry) => (
                                <Flex key={entry.name} gap="sm" align="center" style={{ overflow: 'hidden' }}>
                                  <Box bg={entry.color} w={16} h={16} style={{ flexShrink: 0 }} />
                                  <Text size="xs" lineClamp={1} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {entry.name}: {entry.value}
                                  </Text>
                                </Flex>
                              ))}
                            </SimpleGrid>
                          </Box>
                        </Box>
                      </Paper>
                    )}
                  </Stack>
                </Paper>
              </SimpleGrid>
            </Box>
          </Paper>
        </Box>
        {/* Modal */}
        <Modal opened={opened} onClose={close} title="Ajukan Responden" centered>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <TextInput
                label="Nama"
                type='text'
                placeholder="Masukkan nama"
                value={state.create.form.name}
                onChange={(val) => {
                  state.create.form.name = val.currentTarget.value;
                }}
              />
              <TextInput
                label="Tanggal"
                type="date"
                placeholder="masukkan tanggal"
                value={state.create.form.tanggal}
                onChange={(val) => {
                  state.create.form.tanggal = val.currentTarget.value;
                }}
              />
              <Select
                key={"jenisKelamin"}
                label={"Jenis Kelamin"}
                placeholder={indeksKepuasanState.jenisKelaminResponden.findMany.loading ? 'Memuat...' : 'Pilih jenis kelamin'}
                value={state.create.form.jenisKelaminId || ""}
                onChange={(val) => {
                  state.create.form.jenisKelaminId = val ?? "";
                }}
                data={
                  (indeksKepuasanState.jenisKelaminResponden.findMany.data || [])
                    .filter(Boolean) // Hapus null, undefined, dll
                    .map((item) => ({
                      value: item.id,
                      label: item.name || 'Tanpa Nama',
                    }))
                }
                disabled={indeksKepuasanState.jenisKelaminResponden.findMany.loading}
              />
              <Select
                key={"rating_responden"}
                label={"Rating"}
                placeholder={indeksKepuasanState.pilihanRatingResponden.findMany.loading ? 'Memuat...' : 'Pilih rating'}
                value={state.create.form.ratingId || ""}
                onChange={(val) => {
                  state.create.form.ratingId = val ?? "";
                }}
                data={
                  (indeksKepuasanState.pilihanRatingResponden.findMany.data || [])
                    .filter(Boolean) // Hapus null, undefined, dll
                    .map((item) => ({
                      value: item.id,
                      label: item.name || 'Tanpa Nama',
                    }))
                }
                disabled={indeksKepuasanState.pilihanRatingResponden.findMany.loading}
              />
              <Select
                key={"kelompokUmur"}
                label={"Kelompok Umur"}
                placeholder={indeksKepuasanState.kelompokUmurResponden.findMany.loading ? 'Memuat...' : 'Pilih kelompok umur'}
                value={state.create.form.kelompokUmurId || ""}
                onChange={(val) => {
                  state.create.form.kelompokUmurId = val ?? "";
                }}
                data={
                  (indeksKepuasanState.kelompokUmurResponden.findMany.data || [])
                    .filter(Boolean) // Hapus null, undefined, dll
                    .map((item) => ({
                      value: item.id,
                      label: item.name || 'Tanpa Nama',
                    }))
                }
                disabled={indeksKepuasanState.kelompokUmurResponden.findMany.loading}
              />
              <Button
                mt={10}
                bg={colors['blue-button']}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Stack>
          </Paper>
        </Modal>
      </Stack>
    );
  }
  return (
    <Stack p={"sm"}>
     <Container size="lg" px="md">
        <Center>
          <Text ta={"center"} fz={{ base: "2.4rem", md: "3.4rem" }}>Indeks Kepuasan Masyarakat</Text>
        </Center>
        <Text fz={{ base: "1.2rem", md: "1.4rem" }} ta={"center"}>Ukur kebahagiaan warga, tingkatkan layanan desa! Dengan partisipasi aktif masyarakat, kami berkomitmen untuk terus memperbaiki layanan agar lebih transparan, efektif, dan sesuai dengan kebutuhan warga. Kepuasan Anda adalah prioritas utama kami dalam membangun desa yang lebih baik!</Text>
        <Center mt={10}>
          <Button radius={"lg"} bg={colors["blue-button"]} onClick={open}>Ajukan Responden</Button>
        </Center>
      </Container>
      <Box px={"xl"}>
        <Paper p={"lg"} bg={colors.Bg}>
          <Paper p={"lg"}>
            <Stack gap={"xs"}>
              <Flex
                direction={{ base: "column", sm: "row" }}
                justify="space-between"
                align={{ base: "flex-start", sm: "center" }}
              >
                <Text fw="bold" ta={{ base: "center", sm: "left" }}>
                  Pelayanan Terhadap Publik Desa Darmasaba
                </Text>
                <Box mt={{ base: "sm", sm: 0 }}>
                  <Text fz={"sm"} fw={"bold"} c={colors["blue-button"]}>Total Responden</Text>
                  <Text ta={"end"} fz={"h1"} fw={"bold"} c={colors["blue-button"]}>
                    {state.findMany.total.toLocaleString('id-ID')}
                  </Text>
                </Box>
              </Flex>
              <BarChart
                h={300}
                data={barChartData}
                dataKey="month"
                series={[{ name: 'Responden', color: colors['blue-button'] }]}
                tickLine="y"
                xAxisLabel="Bulan"
                yAxisLabel="Jumlah Responden"
                withTooltip
                tooltipAnimationDuration={200}
              />
            </Stack>
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
              {/* Chart Jenis Kelamin */}
              <Paper bg={colors['white-1']} p="md" radius="md">
                <Stack>
                  <Title order={4}>Jenis Kelamin</Title>
                  {donutDataJenisKelamin.every(item => item.value === 0) ? (
                    <Text c="dimmed" ta="center" my="md">
                      Belum ada data untuk ditampilkan dalam grafik
                    </Text>
                  ) : (
                    <Paper p="md" radius="md" withBorder>
                      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box style={{ position: 'relative', width: '100%' }}>
                          <Center>
                            <PieChart
                              withLabels
                              withTooltip
                              labelsType="percent"
                              size={200}
                              data={donutDataJenisKelamin}
                            />
                          </Center>
                        </Box>
                        <Stack gap="sm" mt="md">
                          {donutDataJenisKelamin.map((entry) => (
                            <Flex key={entry.name} gap="md" align="center">
                              <Box bg={entry.color} w={20} h={20} style={{ flexShrink: 0 }} />
                              <Text size="sm">{entry.name}: {entry.value}</Text>
                            </Flex>
                          ))}
                        </Stack>
                      </Box>
                    </Paper>
                  )}
                </Stack>
              </Paper>

              {/* Chart Rating */}
              <Paper bg={colors['white-1']} p="md" radius="md">
                <Stack>
                  <Title order={4}>Ulasan</Title>
                  {donutDataRating.every(item => item.value === 0) ? (
                    <Text c="dimmed" ta="center" my="md">
                      Belum ada data untuk ditampilkan dalam grafik
                    </Text>
                  ) : (
                    <Paper p="md" radius="md" withBorder>
                      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box style={{ position: 'relative', width: '100%' }}>
                          <Center>
                            <PieChart
                              withTooltip
                              tooltipAnimationDuration={200}
                              withLabels
                              labelsPosition="outside"
                              labelsType="percent"
                              withLabelsLine
                              size={200}
                              data={donutDataRating}
                            />
                          </Center>
                        </Box>
                        <Box mt="md" style={{ width: '100%' }}>
                          <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
                            {donutDataRating.map((entry) => (
                              <Flex key={entry.name} gap="sm" align="center" style={{ overflow: 'hidden' }}>
                                <Box bg={entry.color} w={16} h={16} style={{ flexShrink: 0 }} />
                                <Text size="xs" lineClamp={1} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {entry.name}: {entry.value}
                                </Text>
                              </Flex>
                            ))}
                          </SimpleGrid>
                        </Box>
                      </Box>
                    </Paper>
                  )}
                </Stack>
              </Paper>

              {/* Chart Kelompok Umur */}
              <Paper bg={colors['white-1']} p="md" radius="md">
                <Stack>
                  <Title order={4}>Umur</Title>
                  {donutDataKelompokUmur.every(item => item.value === 0) ? (
                    <Text c="dimmed" ta="center" my="md">
                      Belum ada data untuk ditampilkan dalam grafik
                    </Text>
                  ) : (
                    <Paper p="md" radius="md" withBorder>
                      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box style={{ position: 'relative', width: '100%' }}>
                          <Center>
                            <PieChart
                              withTooltip
                              tooltipAnimationDuration={200}
                              withLabels
                              labelsPosition="outside"
                              labelsType="percent"
                              withLabelsLine
                              size={190}
                              data={donutDataKelompokUmur}
                            />
                          </Center>
                        </Box>
                        <Box mt="md" style={{ width: '100%' }}>
                          <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
                            {donutDataKelompokUmur.map((entry) => (
                              <Flex key={entry.name} gap="sm" align="center" style={{ overflow: 'hidden' }}>
                                <Box bg={entry.color} w={16} h={16} style={{ flexShrink: 0 }} />
                                <Text size="xs" lineClamp={1} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {entry.name}: {entry.value}
                                </Text>
                              </Flex>
                            ))}
                          </SimpleGrid>
                        </Box>
                      </Box>
                    </Paper>
                  )}
                </Stack>
              </Paper>
            </SimpleGrid>
          </Box>
        </Paper>
      </Box>
      {/* Modal */}
      <Modal opened={opened} onClose={close} title="Ajukan Responden" centered>
        <Paper bg={colors['white-1']} p={'md'}>
          <Stack>
            <TextInput
              label="Nama"
              type='text'
              placeholder="masukkan nama"
              value={state.create.form.name}
              onChange={(val) => {
                state.create.form.name = val.currentTarget.value;
              }}
            />
            <TextInput
              label="Tanggal Pengisian"
              type="date"
              placeholder="masukkan tanggal"
              value={state.create.form.tanggal}
              onChange={(val) => {
                state.create.form.tanggal = val.currentTarget.value;
              }}
            />
            <Select
              key={"jenisKelamin"}
              label={"Jenis Kelamin"}
              placeholder={indeksKepuasanState.jenisKelaminResponden.findMany.loading ? 'Memuat...' : 'Pilih jenis kelamin'}
              value={state.create.form.jenisKelaminId || ""}
              onChange={(val) => {
                state.create.form.jenisKelaminId = val ?? "";
              }}
              data={
                (indeksKepuasanState.jenisKelaminResponden.findMany.data || [])
                  .filter(Boolean) // Hapus null, undefined, dll
                  .map((item) => ({
                    value: item.id,
                    label: item.name || 'Tanpa Nama',
                  }))
              }
              disabled={indeksKepuasanState.jenisKelaminResponden.findMany.loading}
            />
            <Select
              key={"rating_responden"}
              label={"Rating"}
              placeholder={indeksKepuasanState.pilihanRatingResponden.findMany.loading ? 'Memuat...' : 'Pilih rating'}
              value={state.create.form.ratingId || ""}
              onChange={(val) => {
                state.create.form.ratingId = val ?? "";
              }}
              data={
                (indeksKepuasanState.pilihanRatingResponden.findMany.data || [])
                  .filter(Boolean) // Hapus null, undefined, dll
                  .map((item) => ({
                    value: item.id,
                    label: item.name || 'Tanpa Nama',
                  }))
              }
              disabled={indeksKepuasanState.pilihanRatingResponden.findMany.loading}
            />
            <Select
              key={"kelompokUmur"}
              label={"Kelompok Umur"}
              placeholder={indeksKepuasanState.kelompokUmurResponden.findMany.loading ? 'Memuat...' : 'Pilih kelompok umur'}
              value={state.create.form.kelompokUmurId || ""}
              onChange={(val) => {
                state.create.form.kelompokUmurId = val ?? "";
              }}
              data={
                (indeksKepuasanState.kelompokUmurResponden.findMany.data || [])
                  .filter(Boolean) // Hapus null, undefined, dll
                  .map((item) => ({
                    value: item.id,
                    label: item.name || 'Tanpa Nama',
                  }))
              }
              disabled={indeksKepuasanState.kelompokUmurResponden.findMany.loading}
            />
            <Button
              mt={10}
              bg={colors['blue-button']}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Stack>
        </Paper>
      </Modal>
    </Stack>
  );
}

export default Kepuasan;
