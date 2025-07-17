/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateDashboardBerita from '@/app/admin/(dashboard)/_state/desa/berita';
import colors from '@/con/colors';
import { Box, Card, Divider, Grid, GridCol, Image, Paper, Stack, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../../desa/layanan/_com/BackButto';
import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';

dayjs.extend(relativeTime);

function InformasiDesa() {
  const stateBerita = useProxy(stateDashboardBerita.berita)
  const statePengumuman = useProxy(stateDesaPengumuman.pengumuman)

  useEffect(() => {
    stateBerita.findFirst.load();
    stateBerita.findRecent.load();
    statePengumuman.findFirst.load();
    statePengumuman.findRecent.load();
  }, []);

  const dataBerita = stateBerita.findFirst.data
  const dataPengumuman = statePengumuman.findFirst.data


  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Informasi Desa
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={10}>
        {dataBerita && (
          <Paper shadow="md" radius="md" p="md">
            <Grid>
              <GridCol span={{ md: 6, base: 12 }}>
                <Image
                  src={dataBerita.image?.link || "/fallback.jpg"}
                  alt={dataBerita.judul}
                  radius="md"
                  fit="cover"
                  height={250}
                  maw={600}
                />
              </GridCol>
              <GridCol span={{ md: 6, base: 12 }}>
                <Box>
                  <Text fz="sm" c="dimmed">{dataBerita.kategoriBerita?.name} • {dayjs(dataBerita.createdAt).fromNow()}</Text>
                  <Title order={1} fw="bold">{dataBerita.judul}</Title>
                  <Text ta={"justify"} mt="xs" fz="md" dangerouslySetInnerHTML={{ __html: dataBerita.content }} />
                </Box>
              </GridCol>
            </Grid>
          </Paper>
        )}
        <Stack py={10}>
          <Title order={3}>Berita Terbaru</Title>
          <Grid>
            {stateBerita.findRecent.data.map((item) => (
              <GridCol span={{ base: 12, sm: 6, md: 3 }} key={item.id}>
                <Card shadow="sm" radius="md" withBorder h="100%">
                  <Card.Section>
                    <Image
                      src={item.image?.link || "/placeholder.jpg"}
                      alt={item.judul}
                      height={160} // gambar fix height
                      fit="cover"
                    />
                  </Card.Section>
                  <Stack gap="xs" mt="sm">
                    <Text fw={600} lineClamp={2}>
                      {item.judul}
                    </Text>
                    <Text size="sm" color="dimmed" lineClamp={2}>
                      {item.deskripsi}
                    </Text>
                    <Text size="xs" c="gray">
                      {dayjs(item.createdAt).fromNow()}
                    </Text>
                  </Stack>
                </Card>
              </GridCol>
            ))}
          </Grid>

        </Stack>
      <Divider color={colors['blue-button']} my="md" />
      {dataPengumuman && (
          <Paper shadow="md" radius="md" p="md">
            <Stack gap={"xs"}>
              <Title order={1} fw="bold">{dataPengumuman.judul}</Title>
              <Text fz="sm" c="dimmed">{dataPengumuman.CategoryPengumuman?.name} • {dayjs(dataPengumuman.createdAt).fromNow()}</Text>
              <Box>
                <Text ta={"justify"} mt="xs" fz="md" dangerouslySetInnerHTML={{ __html: dataPengumuman.content }} />
              </Box>
            </Stack>
          </Paper>
        )}
        <Stack py={10}>
          <Title order={3}>Pengumuman Terbaru</Title>
          <Grid>
            {statePengumuman.findRecent.data.map((item) => (
              <GridCol span={{ base: 12, sm: 6, md: 3 }} key={item.id}>
                <Card shadow="sm" radius="md" withBorder h="100%">
                  <Stack gap="xs" mt="sm">
                    <Text fw={600} lineClamp={2}>
                      {item.judul}
                    </Text>
                    <Text size="sm" color="dimmed" lineClamp={2}>
                      {item.deskripsi}
                    </Text>
                    <Text size="xs" c="gray">
                      {dayjs(item.createdAt).fromNow()}
                    </Text>
                  </Stack>
                </Card>
              </GridCol>
            ))}
          </Grid>

        </Stack>
      </Stack>
      </Box>
    </Stack>
  );
}

export default InformasiDesa;
