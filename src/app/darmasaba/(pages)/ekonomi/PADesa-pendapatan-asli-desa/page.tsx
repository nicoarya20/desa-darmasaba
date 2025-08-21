'use client'
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import { Box, Grid, GridCol, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useShallowEffect } from '@mantine/hooks';


function Page() {
  const state = useProxy(PendapatanAsliDesa.ApbDesa);

  useShallowEffect(() => {
    state.findMany.load();
  }, []);

  useShallowEffect(() => {
    PendapatanAsliDesa.pembiayaan.findMany.load();
    PendapatanAsliDesa.belanja.findMany.load();
    PendapatanAsliDesa.pendapatan.findMany.load();
  }, []);

  // Get the latest APB data
  const latestApb = state.findMany.data?.[0];

  // Calculate totals
  const totalPendapatan = latestApb?.pendapatan?.reduce((sum, item) => sum + (item?.value || 0), 0) || 0;
  const totalBelanja = latestApb?.belanja?.reduce((sum, item) => sum + (item?.value || 0), 0) || 0;
  const totalPembiayaan = latestApb?.pembiayaan?.reduce((sum, item) => sum + (item?.value || 0), 0) || 0;

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="lg">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Text ta="center" fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw="bold">
        Pendapatan Asli Desa
      </Text>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap="lg" justify="center">
          <Paper bg={colors['white-1']} p="xl">
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              {/* Pendapatan Card */}
              <Box p="md" style={{ border: '1px solid #e9ecef', borderRadius: '8px' }}>
                <Stack gap={"xs"}>
                  <Title order={3}>Pendapatan</Title>
                  {PendapatanAsliDesa.pendapatan.findMany.data?.map((item) => (
                    <Box key={item.id}>
                      <Grid>
                        <GridCol span={{ base: 12, md: 6 }}>
                          <Text fz="md" fw={500}>{item.name}</Text>
                        </GridCol>
                        <GridCol span={{ base: 12, md: 6 }}>
                          <Text fz="md" fw={500}>{new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(item.value)}</Text>
                        </GridCol>
                      </Grid>
                    </Box>
                  ))}
                  <Grid>
                    <GridCol span={{ base: 12, md: 6 }}>
                      <Text fz="lg" fw={600} mb="xs">Total Pendapatan</Text>
                    </GridCol>
                    <GridCol span={{ base: 12, md: 6 }}>
                      <Text fz="xl" fw={700} c={colors['blue-button']}>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(totalPendapatan)}
                      </Text>
                    </GridCol>
                  </Grid>
                </Stack>
              </Box>

              {/* Belanja Card */}
              <Box p="md" style={{ border: '1px solid #e9ecef', borderRadius: '8px' }}>
                <Stack gap={"xs"}>
                  <Title order={3}>Belanja</Title>
                  {PendapatanAsliDesa.belanja.findMany.data?.map((item) => (
                    <Box key={item.id}>
                      <Grid>
                        <GridCol span={{ base: 12, md: 6 }}>
                          <Text fz="md" fw={500}>{item.name}</Text>
                        </GridCol>
                        <GridCol span={{ base: 12, md: 6 }}>
                          <Text fz="md" fw={500}>{new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(item.value)}</Text>
                        </GridCol>
                      </Grid>
                    </Box>
                  ))}
                  <Grid>
                    <GridCol span={{ base: 12, md: 6 }}>
                      <Text fz="lg" fw={600} mb="xs">Total Belanja</Text>
                    </GridCol>
                    <GridCol span={{ base: 12, md: 6 }}>
                      <Text fz="xl" fw={700} c="orange">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(totalBelanja)}
                      </Text>
                    </GridCol>
                  </Grid>
                </Stack>
              </Box>

              {/* Pembiayaan Card */}
              <Box p="md" style={{ border: '1px solid #e9ecef', borderRadius: '8px' }}>
                <Stack gap={"xs"}>
                  <Title order={3}>Pembiayaan</Title>
                  {PendapatanAsliDesa.pembiayaan.findMany.data?.map((item) => (
                    <Box key={item.id}>
                      <Grid>
                        <GridCol span={{ base: 12, md: 6 }}>
                          <Text fz="md" fw={500}>{item.name}</Text>
                        </GridCol>
                        <GridCol span={{ base: 12, md: 6 }}>
                          <Text fz="md" fw={500}>{new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(item.value)}</Text>
                        </GridCol>
                      </Grid>
                    </Box>
                  ))}
                  <Grid>
                    <GridCol span={{ base: 12, md: 6 }}>
                      <Text fz="lg" fw={600} mb="xs">Total Pembiayaan</Text>
                    </GridCol>
                    <GridCol span={{ base: 12, md: 6 }}>
                      <Text fz="xl" fw={700} c="green">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(totalPembiayaan)}
                      </Text>
                    </GridCol>
                  </Grid>
                </Stack>
              </Box>
              
            </SimpleGrid>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
