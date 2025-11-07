'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDatabase, IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, Tooltip as RechartTooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import { ModalKonfirmasiHapus } from '../../_com/modalKonfirmasiHapus';
import dataPendidikan from '../../_state/pendidikan/data-pendidikan';

function DataPendidikan() {
  const [search, setSearch] = useState('');
  return (
    <Box py="md">
      <HeaderSearch
        title="Data Pendidikan"
        placeholder="Cari data pendidikan..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDataPendidikan search={search} />
    </Box>
  );
}

function ListDataPendidikan({ search }: { search: string }) {
  type DPMrafik = { id: string; name: string; jumlah: number };
  const stateDPM = useProxy(dataPendidikan);
  const [chartData, setChartData] = useState<DPMrafik[]>([]);
  const [mounted, setMounted] = useState(false);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = () => {
    if (selectedId) {
      stateDPM.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      stateDPM.findMany.load();
    }
  };

  useShallowEffect(() => {
    setMounted(true);
    stateDPM.findMany.load();
  }, []);

  useEffect(() => {
    setMounted(true);
    if (stateDPM.findMany.data) {
      setChartData(
        stateDPM.findMany.data.map((item) => ({
          id: item.id,
          name: item.name,
          jumlah: Number(item.jumlah),
        }))
      );
    }
  }, [stateDPM.findMany.data]);

  const filteredData = (stateDPM.findMany.data || []).filter((item) => {
    const keyword = search.toLowerCase();
    return item.name.toLowerCase().includes(keyword) || item.jumlah.toString().includes(keyword);
  });

  if (!stateDPM.findMany.data) {
    return (
      <Stack gap="sm">
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py="sm">
      <Stack gap="sm">
        <Paper p="md" withBorder bg={colors['white-1']} shadow="sm" radius="md">
          <Group justify="space-between" mb="md">
            <Title order={4}>Daftar Data Pendidikan</Title>
            <Button leftSection={<IconPlus size={18} />} color="blue" variant="light" onClick={() => router.push('/admin/pendidikan/data-pendidikan/create')}>
              Tambah Baru
            </Button>
          </Group>
          {filteredData.length === 0 ? (
            <Box py="lg" px="md" style={{ textAlign: 'center' }}>
              <IconDatabase size={48} stroke={1.5} color={colors['white-1']} />
              <Text mt="sm" c="dimmed">
                Tidak ada data pendidikan yang sesuai pencarian
              </Text>
            </Box>
          ) : (
            <Table striped highlightOnHover>
              <TableThead>
                <TableTr>
                  <TableTh>Nama</TableTh>
                  <TableTh>Jumlah</TableTh>
                  <TableTh>Edit</TableTh>
                  <TableTh>Hapus</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>{item.name}</TableTd>
                    <TableTd>{item.jumlah}</TableTd>
                    <TableTd>
                      <Button
                        color="green"
                        variant="light"
                        radius="md"
                        onClick={() => router.push(`/admin/pendidikan/data-pendidikan/${item.id}`)}
                      >
                        <IconEdit size={20} />
                      </Button>
                    </TableTd>
                    <TableTd>
                      <Button
                        color="red"
                        variant="light"
                        radius="md"
                        disabled={stateDPM.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        <IconTrash size={20} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          )}
        </Paper>

        <Paper withBorder p="md" bg={colors['white-1']} shadow="sm" radius="md">
          <Title order={4} mb="sm">
            Grafik Data Pendidikan
          </Title>
          {mounted && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <RechartTooltip />
                <Legend />
                <Bar dataKey="jumlah" fill={colors['blue-button']} name="Jumlah Pendidikan" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box py="lg" style={{ textAlign: 'center' }}>
              <IconDatabase size={48} stroke={1.5} color={colors['white-1']} />
              <Text mt="sm" c="dimmed">
                Belum ada data untuk ditampilkan
              </Text>
            </Box>
          )}
        </Paper>
      </Stack>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text="Apakah Anda yakin ingin menghapus data pendidikan ini?"
      />
    </Box>
  );
}

export default DataPendidikan;
