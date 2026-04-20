'use client'
import colors from '@/con/colors';
import {
  Box,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
  Badge
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowUpRight, IconArrowDownRight, IconMinus } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import umkmState from '../../../_state/ekonomi/umkm/umkm';

function UmkmDashboard() {
  const state = useProxy(umkmState.dashboard);

  useShallowEffect(() => {
    state.loadAll();
  }, []);

  if (state.kpi.loading || !state.kpi.data) {
    return <Skeleton height={400} radius="md" />;
  }

  const kpi = state.kpi.data;
  const summary = state.summary.data;
  const topProduk = state.topProduk.data;
  const detail = state.detail.data;

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
        <KpiCard title="UMKM Aktif" value={kpi.umkmAktif} subValue={`Total: ${kpi.totalUmkm}`} />
        <KpiCard 
          title="Omzet Bulan Ini" 
          value={`Rp ${kpi.omzetBulanan.toLocaleString()}`} 
          trend={summary?.persentasePerubahan} 
        />
        <KpiCard title="Produk Aktif" value={summary?.produkAktif || 0} />
        <KpiCard title="Kategori Populer" value={kpi.kategoriTerbanyak} />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder radius="md" p="lg" shadow="sm">
            <Title order={4} mb="md">Top 3 Produk</Title>
            <Stack gap="sm">
              {topProduk.map((item, i) => (
                <Group key={i} justify="space-between">
                  <Box>
                    <Text fw={500}>{item.namaProduk}</Text>
                    <Text size="xs" c="dimmed">{item.namaUmkm}</Text>
                  </Box>
                  <Text fw={600} c="blue">Rp {item.totalPenjualan.toLocaleString()}</Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder radius="md" p="lg" shadow="sm">
            <Title order={4} mb="md">Detail Penjualan & Stok</Title>
            <Box style={{ overflowX: 'auto' }}>
              <Table highlightOnHover>
                <TableThead>
                  <TableTr>
                    <TableTh>Produk</TableTh>
                    <TableTh>Penjualan</TableTh>
                    <TableTh>Trend</TableTh>
                    <TableTh>Stok</TableTh>
                    <TableTh>Status</TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {detail.map((item, i) => (
                    <TableTr key={i}>
                      <TableTd>{item.namaProduk}</TableTd>
                      <TableTd>Rp {item.penjualanBulanIni.toLocaleString()}</TableTd>
                      <TableTd>{renderTrend(item.trend)}</TableTd>
                      <TableTd>{item.stok}</TableTd>
                      <TableTd>
                        <Badge color={getStatusColor(item.statusStok)}>
                          {item.statusStok}
                        </Badge>
                      </TableTd>
                    </TableTr>
                  ))}
                </TableTbody>
              </Table>
            </Box>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function KpiCard({ title, value, subValue, trend }: any) {
  return (
    <Card withBorder radius="md" p="lg" shadow="sm">
      <Text size="xs" c="dimmed" fw={700} tt="uppercase">{title}</Text>
      <Group align="flex-end" gap="xs" mt="sm">
        <Text fz="xl" fw={700} lh={1}>{value}</Text>
        {trend !== undefined && (
          <Text c={trend >= 0 ? 'teal' : 'red'} fz="sm" fw={500}>
            {trend >= 0 ? '+' : ''}{trend}%
          </Text>
        )}
      </Group>
      {subValue && <Text size="xs" c="dimmed" mt={4}>{subValue}</Text>}
    </Card>
  );
}

function renderTrend(trend: string) {
  if (trend === 'up') return <IconArrowUpRight size={18} color="green" />;
  if (trend === 'down') return <IconArrowDownRight size={18} color="red" />;
  return <IconMinus size={18} color="gray" />;
}

function getStatusColor(status: string) {
  if (status === 'Aman') return 'green';
  if (status === 'Menipis') return 'yellow';
  return 'red';
}

export default UmkmDashboard;
