'use client'
import colors from '@/con/colors';
import {
  Badge,
  Box,
  Card,
  Grid,
  Group,
  Select,
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
  SegmentedControl,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowUpRight, IconArrowDownRight, IconMinus } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import umkmState from '../../../_state/ekonomi/umkm/umkm';

function UmkmDashboard() {
  const state = useProxy(umkmState.dashboard);

  const [kategoriId, setKategoriId] = useState("");
  const [umkmId, setUmkmId] = useState("");
  const [kategoriList, setKategoriList] = useState<{ value: string; label: string }[]>([]);
  const [umkmList, setUmkmList] = useState<{ value: string; label: string }[]>([]);

  useShallowEffect(() => {
    state.loadAll();
    fetch('/api/ekonomi/kategoriproduk/find-many-all').then(r => r.json()).then(res => {
      if (res.success) setKategoriList(res.data.map((k: any) => ({ value: k.id, label: k.nama })));
    });
    fetch('/api/ekonomi/umkm/find-many-all').then(r => r.json()).then(res => {
      if (res.success) setUmkmList(res.data.map((u: any) => ({ value: u.id, label: u.nama })));
    });
  }, []);

  useEffect(() => {
    if (state.kpi.data) state.loadAll("", state.mode, kategoriId, umkmId);
  }, [kategoriId, umkmId]);

  if (state.kpi.loading || !state.kpi.data) {
    return <Skeleton height={400} radius="md" />;
  }

  const kpi = state.kpi.data;
  const summary = state.summary.data;
  const topProduk = state.topProduk.data;
  const detail = state.detail.data;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={4}>Update Penjualan Produk</Title>
        <SegmentedControl
          value={state.mode}
          onChange={(v) => state.loadAll("", v as "week" | "month", kategoriId, umkmId)}
          data={[
            { label: 'Minggu ini', value: 'week' },
            { label: 'Bulan ini', value: 'month' },
          ]}
        />
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
        <KpiCard title="UMKM Aktif" value={kpi.umkmAktif} subValue={`Total: ${kpi.totalUmkm}`} />
        <KpiCard
          title="Omzet Bulan Ini"
          value={`Rp ${kpi.omzetBulanan.toLocaleString()}`}
          trend={summary?.persentasePerubahan}
        />
        <KpiCard title="Kategori Aktif" value={summary?.kategoriAktif || 0} subValue="kategori" />
        <KpiCard
          title="UMKM Terbanyak"
          value={kpi.jumlahKategoriTerbanyak || 0}
          subValue={kpi.kategoriTerbanyak}
        />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={12}>
          <Card withBorder radius="md" p="lg" shadow="sm">
            <Title order={4} mb="md">Grafik Penjualan per Produk</Title>
            {/* Scroll horizontal: tiap produk diberi lebar min ~140px agar label
                sumbu-X tidak numpuk saat produk banyak — geser untuk lihat sisanya */}
            <Box style={{ overflowX: 'auto' }}>
              <Box style={{ height: 350, minWidth: Math.max(detail.length * 140, 600) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detail.map((item: any) => ({
                    name: item.namaProduk,
                    penjualan: item.penjualanBulanIni
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `Rp ${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="penjualan" fill={colors['blue-button']} name="Penjualan" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card h="100%" withBorder radius="md" p="lg" shadow="sm">
            <Title order={4} mb="md">Top 3 Produk Terlaris</Title>
            <Stack gap="sm">
              {topProduk.map((item: any, i: number) => (
                <Group key={i} justify="space-between" wrap="nowrap">
                  <Box>
                    <Text fw={500} size="sm">{item.namaProduk}</Text>
                    <Text size="xs" c="dimmed">{item.namaUmkm}</Text>
                    <Text size="xs" c="dimmed">
                      Rp {item.totalPenjualan.toLocaleString()} · {item.jumlahTerjual} terjual
                    </Text>
                  </Box>
                  <Badge color={item.growth >= 0 ? 'teal' : 'red'} variant="light" size="sm">
                    {item.growth >= 0 ? '+' : ''}{item.growth}%
                  </Badge>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder radius="md" p="lg" shadow="sm">
            <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
              <Title order={4}>Detail Penjualan Produk</Title>
              <Group gap="sm">
                <Select
                  placeholder="Semua Kategori"
                  data={kategoriList}
                  value={kategoriId || null}
                  onChange={(v) => setKategoriId(v || "")}
                  clearable
                  size="xs"
                  style={{ minWidth: 140 }}
                />
                <Select
                  placeholder="Semua UMKM"
                  data={umkmList}
                  value={umkmId || null}
                  onChange={(v) => setUmkmId(v || "")}
                  clearable
                  size="xs"
                  style={{ minWidth: 140 }}
                />
              </Group>
            </Group>
            <Box style={{ overflowX: 'auto' }} visibleFrom="md">
              <Table highlightOnHover>
                <TableThead>
                  <TableTr>
                    <TableTh>Produk</TableTh>
                    <TableTh>Penjualan Bulan Ini</TableTh>
                    <TableTh>Bulan Lalu</TableTh>
                    <TableTh>Trend</TableTh>
                    <TableTh>Volume</TableTh>
                    <TableTh>Stok</TableTh>
                    <TableTh>Status</TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {detail.map((item: any, i: number) => (
                    <TableTr key={i}>
                      <TableTd>{item.namaProduk}</TableTd>
                      <TableTd>Rp {item.penjualanBulanIni.toLocaleString()}</TableTd>
                      <TableTd>Rp {item.penjualanBulanLalu.toLocaleString()}</TableTd>
                      <TableTd>
                        <Group gap={4} wrap="nowrap">
                          {renderTrend(item.trend)}
                          {item.trendPersen !== 0 && (
                            <Text
                              size="xs"
                              c={item.trend === 'up' ? 'green' : item.trend === 'down' ? 'red' : 'dimmed'}
                            >
                              {item.trendPersen > 0 ? '+' : ''}{item.trendPersen}%
                            </Text>
                          )}
                        </Group>
                      </TableTd>
                      <TableTd>{item.volume}</TableTd>
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

            {/* Mobile: kartu per produk — hindari scroll horizontal tabel 7 kolom */}
            <Stack gap="sm" hiddenFrom="md">
              {detail.map((item: any, i: number) => (
                <Card key={i} withBorder radius="md" p="sm" shadow="xs">
                  <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                    <Text fw={600} size="sm" style={{ flex: 1 }}>{item.namaProduk}</Text>
                    <Badge color={getStatusColor(item.statusStok)}>{item.statusStok}</Badge>
                  </Group>
                  <Stack gap={6}>
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="xs" c="dimmed">Penjualan Bulan Ini</Text>
                      <Text size="sm" fw={500}>Rp {item.penjualanBulanIni.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="xs" c="dimmed">Bulan Lalu</Text>
                      <Text size="sm">Rp {item.penjualanBulanLalu.toLocaleString()}</Text>
                    </Group>
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="xs" c="dimmed">Trend</Text>
                      <Group gap={4} wrap="nowrap">
                        {renderTrend(item.trend)}
                        {item.trendPersen !== 0 && (
                          <Text
                            size="xs"
                            c={item.trend === 'up' ? 'green' : item.trend === 'down' ? 'red' : 'dimmed'}
                          >
                            {item.trendPersen > 0 ? '+' : ''}{item.trendPersen}%
                          </Text>
                        )}
                      </Group>
                    </Group>
                    <Group grow wrap="nowrap">
                      <Box>
                        <Text size="xs" c="dimmed">Volume</Text>
                        <Text size="sm">{item.volume}</Text>
                      </Box>
                      <Box>
                        <Text size="xs" c="dimmed">Stok</Text>
                        <Text size="sm">{item.stok}</Text>
                      </Box>
                    </Group>
                  </Stack>
                </Card>
              ))}
            </Stack>
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
