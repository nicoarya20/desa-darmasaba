"use client";
import indeksKepuasanState from "@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan";
import colors from "@/con/colors";
import { BarChart, PieChart } from '@mantine/charts';
import { Box, Button, Center, Container, Flex, Modal, Paper, Select, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from "@mantine/core";
import { useDisclosure, useMediaQuery, useShallowEffect } from "@mantine/hooks";
import { useMemo } from "react";
import { useProxy } from "valtio/utils";
import { summarizeKepuasan } from "./kepuasan.logic";
import { RESPONDEN_CHART_LIMIT } from "./kepuasan.meta";

function Kepuasan() {
  const state = useProxy(indeksKepuasanState.responden);
  // Snapshot 3 cabang opsi agar Select re-render saat findMany.load() async
  // selesai — JSX sebelumnya baca raw proxy (loading/data tak reaktif).
  const snapJK = useProxy(indeksKepuasanState.jenisKelaminResponden);
  const snapRating = useProxy(indeksKepuasanState.pilihanRatingResponden);
  const snapUmur = useProxy(indeksKepuasanState.kelompokUmurResponden);
  const { data, loading } = state.findMany;
  const [opened, { open, close }] = useDisclosure(false)
  const isMobile = useMediaQuery("(max-width: 768px)");

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
  }, [])

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

  // Muat data saat mount; data grafik diturunkan langsung dari snapshot (lihat kepuasan.logic.ts).
  useShallowEffect(() => {
    if (!data && !loading) {
      state.findMany.load(1, RESPONDEN_CHART_LIMIT); // halaman 1 dengan limit besar agar grafik mencakup semua data
    }
  }, [data]);

  const {
    jenisKelamin: donutDataJenisKelamin,
    rating: donutDataRating,
    kelompokUmur: donutDataKelompokUmur,
    monthly: barChartData,
  } = useMemo(() => summarizeKepuasan(data), [data]);

  if ((loading && !data) || !data) {
    return (
      <Stack px="sm" py="var(--section-pad-y)">
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
      <Stack px="sm" py="var(--section-pad-y)">
        <Container w={{ base: "100%", md: "80%" }} px="sm">
          <Center>
            <Title
              order={2}
              ta="center"
              fz={{ base: '2rem', md: '2.8rem' }}
              lh={{ base: 1.05, md: 1.04 }}
              c={colors['blue-button']}
              fw={800}
              style={{ letterSpacing: '-0.5px' }}
            >
              Indeks Kepuasan Masyarakat
            </Title>
          </Center>

          <Text
            ta="center"
            fz={{ base: "0.95rem", md: "1.25rem" }}
            lh={{ base: 1.45, md: 1.5 }}
            c="black"
            mt="sm"
          >
            Ukur kebahagiaan warga, tingkatkan layanan desa! Dengan partisipasi aktif masyarakat, kami berkomitmen untuk terus memperbaiki layanan agar lebih transparan, efektif, dan sesuai dengan kebutuhan warga. Kepuasan Anda adalah prioritas utama kami dalam membangun desa yang lebih baik!
          </Text>

          <Center mt={12}>
            <Button
              radius="lg"
              onClick={open}
              variant="gradient"
              gradient={{ from: "#26667F", to: "#124170" }}
              style={{ paddingLeft: 20, paddingRight: 20, fontWeight: 600 }}
            >
              <Text fz={{ base: "0.95rem", md: "1rem" }} ta="center" c="white">Ajukan Responden</Text>
            </Button>
          </Center>
        </Container>

        <Box px="sm">
          <Paper p="lg" bg={colors.Bg}>
            <Paper p="lg">
              <Stack gap="xs">
                <Flex
                  direction={{ base: "column", sm: "row" }}
                  justify="space-between"
                  align={{ base: "flex-start", sm: "center" }}
                  gap={{ base: "xs", sm: "md" }}
                >
                  <Text
                    fw={700}
                    ta={{ base: "center", sm: "left" }}
                    fz={{ base: "0.95rem", sm: "1rem" }}
                    lh={1.3}
                  >
                    Pelayanan Terhadap Publik Desa Darmasaba
                  </Text>

                  <Box
                    mt={{ base: "sm", sm: 0 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      textAlign: 'right',
                    }}
                  >
                    <Text fz={{ base: "0.8rem", sm: "0.95rem" }} fw={700} c={colors["blue-button"]} lh={1.2}>
                      Total Responden
                    </Text>
                    <Text
                      ta="end"
                      fz={{ base: "1.6rem", sm: "2rem" }}
                      fw={800}
                      c={colors["blue-button"]}
                      lh={1.02}
                    >
                      {state.findMany.total.toLocaleString('id-ID')}
                    </Text>
                  </Box>
                </Flex>

                <Box style={{ overflowX: 'auto', width: '100%' }}>
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
                    xAxisProps={{
                      angle: -45,
                      textAnchor: 'end',
                      fontSize: 12,
                    }}
                    style={{ minWidth: 'fit-content' }}
                  />
                </Box>
              </Stack>
            </Paper>

            <Box py="xl">
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" verticalSpacing="md">
                {/* Chart Jenis Kelamin */}
                <Paper bg={colors['white-1']} p="md" radius="md">
                  <Stack>
                    <Title order={4} fz={{ base: "1rem", md: "1.1rem" }} lh={1.2}>Jenis Kelamin</Title>
                    {donutDataJenisKelamin.every(item => item.value === 0) ? (
                      <Text c="dimmed" ta="center" my="md" fz="sm">Belum ada data untuk ditampilkan dalam grafik</Text>
                    ) : (
                      <Paper p="md" radius="md" withBorder>
                        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box style={{ position: 'relative', width: '100%' }}>
                            <Center>
                              <PieChart
                                withTooltip
                                tooltipAnimationDuration={200}
                                withLabels
                                labelsPosition="inside"
                                labelsType="percent"
                                withLabelsLine
                                size={isMobile ? 180 : 250}
                                data={donutDataJenisKelamin}
                              />
                            </Center>
                          </Box>

                          <Stack gap="sm" mt="md">
                            {donutDataJenisKelamin.map((entry) => (
                              <Flex key={entry.name} gap="md" align="center">
                                <Box bg={entry.color} w={20} h={20} style={{ flexShrink: 0 }} />
                                <Text fz="sm" lh={1.25}>{entry.name}: {entry.value}</Text>
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
                    <Title order={4} fz={{ base: "1rem", md: "1.1rem" }} lh={1.2}>Ulasan</Title>
                    {donutDataRating.every(item => item.value === 0) ? (
                      <Text c="dimmed" ta="center" my="md" fz="sm">Belum ada data untuk ditampilkan dalam grafik</Text>
                    ) : (
                      <Paper p="md" radius="md" withBorder>
                        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box style={{ position: 'relative', width: '100%' }}>
                            <Center>
                              <PieChart
                                withTooltip
                                tooltipAnimationDuration={200}
                                withLabels
                                labelsPosition="inside"
                                labelsType="percent"
                                withLabelsLine
                                size={isMobile ? 180 : 250}
                                data={donutDataRating}
                              />
                            </Center>
                          </Box>

                          <Box mt="md" style={{ width: '100%' }}>
                            <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
                              {donutDataRating.map((entry) => (
                                <Flex key={entry.name} gap="sm" align="center" style={{ overflow: 'hidden' }}>
                                  <Box bg={entry.color} w={16} h={16} style={{ flexShrink: 0 }} />
                                  <Text fz="xs" lh={1.2} lineClamp={1} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                    <Title order={4} fz={{ base: "1rem", md: "1.1rem" }} lh={1.2}>Umur</Title>
                    {donutDataKelompokUmur.every(item => item.value === 0) ? (
                      <Text c="dimmed" ta="center" my="md" fz="sm">Belum ada data untuk ditampilkan dalam grafik</Text>
                    ) : (
                      <Paper p="md" radius="md" withBorder>
                        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box style={{ position: 'relative', width: '100%' }}>
                            <Center>
                              <PieChart
                                withTooltip
                                tooltipAnimationDuration={200}
                                withLabels
                                labelsPosition="inside"
                                labelsType="percent"
                                withLabelsLine
                                size={isMobile ? 180 : 250}
                                data={donutDataKelompokUmur}
                              />
                            </Center>
                          </Box>

                          <Box mt="md" style={{ width: '100%' }}>
                            <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
                              {donutDataKelompokUmur.map((entry) => (
                                <Flex key={entry.name} gap="sm" align="center" style={{ overflow: 'hidden' }}>
                                  <Box bg={entry.color} w={16} h={16} style={{ flexShrink: 0 }} />
                                  <Text fz="xs" lh={1.2} lineClamp={1} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
          <Paper bg={colors['white-1']} p="md">
            <Stack>
              <TextInput
                label="Nama"
                type="text"
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
                placeholder={snapJK.findMany.loading ? 'Memuat...' : 'Pilih jenis kelamin'}
                value={state.create.form.jenisKelaminId || ""}
                onChange={(val) => {
                  state.create.form.jenisKelaminId = val ?? "";
                }}
                data={
                  (snapJK.findMany.data || [])
                    .filter(Boolean) // Hapus null, undefined, dll
                    .map((item) => ({
                      value: item.id,
                      label: item.name || 'Tanpa Nama',
                    }))
                }
                disabled={snapJK.findMany.loading}
              />
              <Select
                key={"rating_responden"}
                label={"Rating"}
                placeholder={snapRating.findMany.loading ? 'Memuat...' : 'Pilih rating'}
                value={state.create.form.ratingId || ""}
                onChange={(val) => {
                  state.create.form.ratingId = val ?? "";
                }}
                data={
                  (snapRating.findMany.data || [])
                    .filter(Boolean) // Hapus null, undefined, dll
                    .map((item) => ({
                      value: item.id,
                      label: item.name || 'Tanpa Nama',
                    }))
                }
                disabled={snapRating.findMany.loading}
              />
              <Select
                key={"kelompokUmur"}
                label={"Kelompok Umur"}
                placeholder={snapUmur.findMany.loading ? 'Memuat...' : 'Pilih kelompok umur'}
                value={state.create.form.kelompokUmurId || ""}
                onChange={(val) => {
                  state.create.form.kelompokUmurId = val ?? "";
                }}
                data={
                  (snapUmur.findMany.data || [])
                    .filter(Boolean) // Hapus null, undefined, dll
                    .map((item) => ({
                      value: item.id,
                      label: item.name || 'Tanpa Nama',
                    }))
                }
                disabled={snapUmur.findMany.loading}
              />
              <Button
                mt={10}
                bg={colors['blue-button']}
                onClick={handleSubmit}
                style={{ fontWeight: 700 }}
              >
                <Text fz="sm" ta="center" c="white">Submit</Text>
              </Button>
            </Stack>
          </Paper>
        </Modal>
      </Stack>
    );
  }

  return (
    <Stack px="sm" py="var(--section-pad-y)">
      <Container size="lg" px="sm">
        <Center>
          <Title
            order={2}
            ta="center"
            fz={{ base: '2rem', md: '2.8rem' }}
            lh={{ base: 1.05, md: 1.04 }}
            c={colors['blue-button']}
            fw={800}
            style={{ letterSpacing: '-0.5px' }}
          >
            Indeks Kepuasan Masyarakat
          </Title>
        </Center>

        <Text fz={{ base: "1rem", md: "1.25rem" }} ta="center" c="black" lh={1.5} mt="sm">
          Ukur kebahagiaan warga, tingkatkan layanan desa! Dengan partisipasi aktif masyarakat, kami berkomitmen untuk terus memperbaiki layanan agar lebih transparan, efektif, dan sesuai dengan kebutuhan warga. Kepuasan Anda adalah prioritas utama kami dalam membangun desa yang lebih baik!
        </Text>

        <Center mt={12}>
          <Button radius="lg" bg={colors["blue-button"]} onClick={open} style={{ paddingLeft: 20, paddingRight: 20, fontWeight: 600 }}>
            <Text fz={{ base: "0.95rem", md: "1rem" }} ta="center" c="white">Ajukan Responden</Text>
          </Button>
        </Center>
      </Container>

      <Box px="md">
        <Paper p="lg" bg={colors.Bg}>
          <Paper p="lg">
            <Stack gap="xs">
              <Flex
                direction={{ base: "column", sm: "row" }}
                justify="space-between"
                align={{ base: "flex-start", sm: "center" }}
                gap={{ base: "xs", sm: "md" }}
              >
                <Text
                  fw={700}
                  ta={{ base: "center", sm: "left" }}
                  fz={{ base: "0.95rem", sm: "1rem" }}
                  lh={1.3}
                >
                  Pelayanan Terhadap Publik Desa Darmasaba
                </Text>

                <Box
                  mt={{ base: "sm", sm: 0 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    textAlign: 'right',
                  }}
                >
                  <Text fz={{ base: "0.8rem", sm: "0.95rem" }} fw={700} c={colors["blue-button"]} lh={1.2}>
                    Total Responden
                  </Text>
                  <Text
                    ta="end"
                    fz={{ base: "1.6rem", sm: "2rem" }}
                    fw={800}
                    c={colors["blue-button"]}
                    lh={1.02}
                  >
                    {state.findMany.total.toLocaleString('id-ID')}
                  </Text>
                </Box>
              </Flex>

              <Box style={{ overflowX: 'auto', width: '100%' }} pb={50}>
                <BarChart
                  h={300}
                  data={barChartData}
                  dataKey="month"
                  series={[{ name: 'Responden', color: colors['blue-button'] }]}
                  tickLine="y"
                  xAxisLabel=""
                  yAxisLabel="Jumlah Responden"
                  withTooltip
                  tooltipAnimationDuration={200}
                  xAxisProps={{
                    angle: -45,
                    textAnchor: 'end',
                    fontSize: 12,
                  }}
                  style={{ minWidth: 'fit-content' }}
                />
              </Box>
            </Stack>
          </Paper>

          <Box py="xl">
            <SimpleGrid cols={{ base: 1, md: 1, lg: 1, xl: 3 }}>
              {/* Chart Jenis Kelamin */}
              <Paper bg={colors['white-1']} p="md" radius="md">
                <Stack>
                  <Title order={4} fz={{ base: "1rem", md: "1.1rem" }} lh={1.2}>Jenis Kelamin</Title>
                  {donutDataJenisKelamin.every(item => item.value === 0) ? (
                    <Text c="dimmed" ta="center" my="md" fz="sm">Belum ada data untuk ditampilkan dalam grafik</Text>
                  ) : (
                    <Paper p="md" radius="md" withBorder>
                      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box style={{ position: 'relative', width: '100%' }}>
                          <Center>
                            <PieChart
                              withLabels
                              withTooltip
                              labelsPosition="inside"
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
                              <Text fz="sm" lh={1.25}>{entry.name}: {entry.value}</Text>
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
                  <Title order={4} fz={{ base: "1rem", md: "1.1rem" }} lh={1.2}>Ulasan</Title>
                  {donutDataRating.every(item => item.value === 0) ? (
                    <Text c="dimmed" ta="center" my="md" fz="sm">Belum ada data untuk ditampilkan dalam grafik</Text>
                  ) : (
                    <Paper p="md" radius="md" withBorder>
                      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box style={{ position: 'relative', width: '100%' }}>
                          <Center>
                            <PieChart
                              withTooltip
                              tooltipAnimationDuration={200}
                              withLabels
                              labelsPosition="inside"
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
                                <Text fz="xs" lh={1.2} lineClamp={1} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                  <Title order={4} fz={{ base: "1rem", md: "1.1rem" }} lh={1.2}>Umur</Title>
                  {donutDataKelompokUmur.every(item => item.value === 0) ? (
                    <Text c="dimmed" ta="center" my="md" fz="sm">Belum ada data untuk ditampilkan dalam grafik</Text>
                  ) : (
                    <Paper p="md" radius="md" withBorder>
                      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box style={{ position: 'relative', width: '100%' }}>
                          <Center>
                            <PieChart
                              withTooltip
                              tooltipAnimationDuration={200}
                              withLabels
                              labelsPosition="inside"
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
                                <Text fz="xs" lh={1.2} lineClamp={1} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
        <Paper bg={colors['white-1']} p="md">
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
              label="Tanggal Pengisian"
              type="date"
              placeholder="Masukkan tanggal"
              value={state.create.form.tanggal}
              onChange={(val) => {
                state.create.form.tanggal = val.currentTarget.value;
              }}
            />
            <Select
              key={"jenisKelamin"}
              label={"Jenis Kelamin"}
              placeholder={snapJK.findMany.loading ? 'Memuat...' : 'Pilih jenis kelamin'}
              value={state.create.form.jenisKelaminId || ""}
              onChange={(val) => {
                state.create.form.jenisKelaminId = val ?? "";
              }}
              data={
                (snapJK.findMany.data || [])
                  .filter(Boolean) // Hapus null, undefined, dll
                  .map((item) => ({
                    value: item.id,
                    label: item.name || 'Tanpa Nama',
                  }))
              }
              disabled={snapJK.findMany.loading}
            />
            <Select
              key={"rating_responden"}
              label={"Rating"}
              placeholder={snapRating.findMany.loading ? 'Memuat...' : 'Pilih rating'}
              value={state.create.form.ratingId || ""}
              onChange={(val) => {
                state.create.form.ratingId = val ?? "";
              }}
              data={
                (snapRating.findMany.data || [])
                  .filter(Boolean) // Hapus null, undefined, dll
                  .map((item) => ({
                    value: item.id,
                    label: item.name || 'Tanpa Nama',
                  }))
              }
              disabled={snapRating.findMany.loading}
            />
            <Select
              key={"kelompokUmur"}
              label={"Kelompok Umur"}
              placeholder={snapUmur.findMany.loading ? 'Memuat...' : 'Pilih kelompok umur'}
              value={state.create.form.kelompokUmurId || ""}
              onChange={(val) => {
                state.create.form.kelompokUmurId = val ?? "";
              }}
              data={
                (snapUmur.findMany.data || [])
                  .filter(Boolean) // Hapus null, undefined, dll
                  .map((item) => ({
                    value: item.id,
                    label: item.name || 'Tanpa Nama',
                  }))
              }
              disabled={snapUmur.findMany.loading}
            />
            <Button
              mt={10}
              bg={colors['blue-button']}
              onClick={handleSubmit}
              style={{ fontWeight: 700 }}
            >
              <Text fz="sm" ta="center" c="white">Submit</Text>
            </Button>
          </Stack>
        </Paper>
      </Modal>
    </Stack>
  );
}

export default Kepuasan;