'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { useSnapshot } from 'valtio';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import grafikHasilKepuasanMasyarakat from '../../../_state/ppid/indeks_kepuasan_masyarakat/grafikHasilKepuasan';


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

  const { data, page, totalPages, loading, load } = stateGrafikHasilKepuasan.findMany


  useShallowEffect(() => {
    setMounted(true)
    load(page, 10)
  }, [page])

  useEffect(() => {
    if (data) {
      setChartData(
        data.map((item) => ({
          id: item.id,
          label: item.label,
          kepuasan: Number(item.kepuasan),
        }))
      );
    }
  }, [data]);

  const filteredData = (data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.label.toLowerCase().includes(keyword) ||
      item.kepuasan.toString().toLowerCase().includes(keyword)
    );
  });

  const handleDelete = () => {
    if (selectedId) {
      stateGrafikHasilKepuasan.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)

      stateGrafikHasilKepuasan.findMany.load()
    }
  }

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={730} />
      </Stack>
    );
  }
  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper p="md" >
          <Stack>
            <JudulList
              title='List Data Hasil Kepuasan Masyarakat'
              href='/admin/ppid/ikm-desa-darmasaba/grafik_hasil_kepuasan_masyarakat/create'
            />
            <Table striped withTableBorder withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh>No</TableTh>
                  <TableTh>Label</TableTh>
                  <TableTh>Jumlah Kepuasan</TableTh>
                  <TableTh>Edit</TableTh>
                  <TableTh>Delete</TableTh>
                </TableTr>
              </TableThead>
            </Table>
            <Text ta="center">Tidak ada data grafik hasil kepuasan masyarakat yang tersedia</Text>
          </Stack>
        </Paper>
      </Box >
    );
  }
  return (
    <Box>
      <Stack gap={"xs"}>
        <Paper bg={colors['white-1']} p={'md'} h={{ base: 730, md: 650 }}>
          <JudulList
            title='List Data Hasil Kepuasan Masyarakat'
            href='/admin/ppid/ikm-desa-darmasaba/grafik_hasil_kepuasan_masyarakat/create'
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '5%', textAlign: 'center' }}>No</TableTh>
                <TableTh style={{ width: '20%', textAlign: 'center' }}>Label</TableTh>
                <TableTh style={{ width: '20%', textAlign: 'center' }}>Jumlah Kepuasan</TableTh>
                <TableTh style={{ width: '15%', textAlign: 'center' }}>Edit</TableTh>
                <TableTh style={{ width: '15%', textAlign: 'center' }}>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item, index) => (
                <TableTr key={item.id}>
                  <TableTd style={{ textAlign: 'center' }}>{index + 1}</TableTd>
                  <TableTd style={{ textAlign: 'center' }}>{item.label}</TableTd>
                  <TableTd style={{ textAlign: 'center' }}>{item.kepuasan}</TableTd>
                  <TableTd style={{ textAlign: 'center' }}>
                    <Button color='green' onClick={() => router.push(`/admin/ppid/ikm-desa-darmasaba/grafik_hasil_kepuasan_masyarakat/${item.id}`)}>
                      <IconEdit size={20} />
                    </Button>
                  </TableTd>
                  <TableTd style={{ textAlign: 'center' }}>
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
        <Center>
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 10);
              window.scrollTo(0, 0);
            }}
            total={totalPages}
            mt="md"
            mb="md"
          />
        </Center>

        {/* Chart */}
        <Box style={{ width: '100%', minWidth: 300, height: 500, minHeight: 300 }}>
          <Paper style={{ width: '100%', minWidth: 300, height: 500, minHeight: 300 }} bg={colors['white-1']} p={'md'}>
            <Stack gap={"xs"}>
              <Title pb={10} order={3}>Grafik Hasil Kepuasan Masyarakat</Title>
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
