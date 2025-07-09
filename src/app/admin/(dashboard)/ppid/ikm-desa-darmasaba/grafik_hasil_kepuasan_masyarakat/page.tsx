'use client'
import JudulListTab from '@/app/admin/(dashboard)/_com/judulListTab';
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { useSnapshot } from 'valtio';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import grafikHasilKepuasanMasyarakat from '../../../_state/ppid/indeks_kepuasan_masyarakat/grafikHasilKepuasan';
import HeaderSearch from '../../../_com/header';


function GrafikHasilKepuasanMasyarakat() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Grafik Hasil Kepuasan Masyarakat'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListGrafikHasilKepuasanMasyarakat search={search} />
    </Box>
  );
}

function ListGrafikHasilKepuasanMasyarakat({ search }: { search: string }) {
  type IKMGrafik = {
    id: string;
    label: string;
    kepuasan: number;
  }


  const stateGrafikHasilKepuasan = useSnapshot(grafikHasilKepuasanMasyarakat)
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<IKMGrafik[]>([]);
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();



  const handleDelete = () => {
    if (selectedId) {
      stateGrafikHasilKepuasan.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)

      stateGrafikHasilKepuasan.findMany.load()
    }
  }

  useShallowEffect(() => {
    setMounted(true)
    stateGrafikHasilKepuasan.findMany.load()
  }, [])

  useEffect(() => {
    if (stateGrafikHasilKepuasan.findMany.data) {
      setChartData(
        stateGrafikHasilKepuasan.findMany.data.map((item) => ({
          id: item.id,
          label: item.label,
          kepuasan: Number(item.kepuasan),
        }))
      );
    }
  }, [stateGrafikHasilKepuasan.findMany.data]);

  const filteredData = (stateGrafikHasilKepuasan.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.label.toLowerCase().includes(keyword) ||
      item.kepuasan.toString().toLowerCase().includes(keyword)
    );
  });



  if (!stateGrafikHasilKepuasan.findMany.data) {
    return (
      <Stack>
        <Skeleton h={500} />
      </Stack>
    )
  }
  return (
    <Box>
      <Stack gap={"xs"}>
        <Paper bg={colors['white-1']} p={'md'}>
          <JudulListTab
            title='List Grafik Hasil Kepuasan Masyarakat'
            href='/admin/ppid/ikm-desa-darmasaba/grafik_hasil_kepuasan_masyarakat/create'
            placeholder='pencarian'
            searchIcon={<IconSearch size={16} />}
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Label</TableTh>
                <TableTh>Jumlah Kepuasan</TableTh>
                <TableTh>Edit</TableTh>
                <TableTh>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.label}</TableTd>
                  <TableTd>{item.kepuasan}</TableTd>
                  <TableTd>
                    <Button color='green' onClick={() => router.push(`/admin/ppid/ikm-desa-darmasaba/grafik_hasil_kepuasan_masyarakat/${item.id}`)}>
                      <IconEdit size={20} />
                    </Button>
                  </TableTd>
                  <TableTd>
                    <Button
                      color='red'
                      disabled={stateGrafikHasilKepuasan.delete.loading}
                      onClick={() => {
                        setSelectedId(item.id)
                        setModalHapus(true)
                      }}>
                      <IconTrash size={20} />
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Paper>

        {/* Chart */}
        <Box style={{ width: '100%', minWidth: 300, height: 500, minHeight: 300 }}>
          <Paper style={{ width: '100%', minWidth: 300, height: 500, minHeight: 300 }} bg={colors['white-1']} p={'md'}>
            <Stack gap={"xs"}>
              <Title pb={10} order={3}>Data Kepuasan Masyarakat</Title>
              {mounted && chartData.length > 0 ? (
                <BarChart width={isMobile ? 300 : isTablet ? 300 : 300} height={380} data={chartData} >
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="kepuasan" fill={colors['blue-button']} name="Kepuasan" />
                </BarChart>
              ) : (
                <Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>
              )}
            </Stack>
          </Paper>
        </Box>
      </Stack>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text='Apakah anda yakin ingin menghapus grafik hasil kepuasan masyarakat ini?'
      />
    </Box>

  );
}

export default GrafikHasilKepuasanMasyarakat;
