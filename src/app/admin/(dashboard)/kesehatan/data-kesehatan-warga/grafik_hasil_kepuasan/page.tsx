'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { useProxy } from 'valtio/utils';
import JudulListTab from '../../../_com/jusulListTab';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import grafikkepuasan from '../../../_state/kesehatan/data_kesehatan_warga/grafikKepuasan';

function GrafikHasilKepuasanMasyarakat() {
  type PDKMGrafik = {
    id: string;
    label: string;
    jumlah: number;
  }
  const stateGrafikKepuasan = useProxy(grafikkepuasan);
  const [chartData, setChartData] = useState<PDKMGrafik[]>([]);
  const [mounted, setMounted] = useState(false); // untuk memastikan DOM sudah ready
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter();

  const handleDelete = () => {
    if (selectedId) {
      stateGrafikKepuasan.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)

      stateGrafikKepuasan.findMany.load()
    }
  }

  useShallowEffect(() => {
    setMounted(true)
    stateGrafikKepuasan.findMany.load()
  }, [])

  useEffect(() => {
    setMounted(true);
    if (stateGrafikKepuasan.findMany.data) {
      setChartData(stateGrafikKepuasan.findMany.data.map((item) => ({
        id: item.uuid,
        label: item.label,
        jumlah: Number(item.jumlah),
      })));
    }
  }, [stateGrafikKepuasan.findMany.data]);

  if (!stateGrafikKepuasan.findMany.data) {
    return (
      <Stack>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box>
      <Stack gap={"xs"}>
        {/* Form Input */}
        <Paper bg={colors['white-1']} p={'md'}>
          <JudulListTab
            title='List Grafik Hasil Kepuasan Masyarakat'
            href='/admin/kesehatan/data-kesehatan-warga/grafik_hasil_kepuasan/create'
            placeholder='pencarian'
            searchIcon={<IconSearch size={16} />}
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Label</TableTh>
                <TableTh>Jumlah</TableTh>
                <TableTh>Edit</TableTh>
                <TableTh>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {stateGrafikKepuasan.findMany.data?.map((item) => (
                <TableTr key={item.uuid}>
                  <TableTd>{item.label}</TableTd>
                  <TableTd>{item.jumlah}</TableTd>
                  <TableTd>
                    <Button color='green' onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/grafik_hasil_kepuasan/${item.uuid}`)}>
                      <IconEdit size={20} />
                    </Button>
                  </TableTd>
                  <TableTd>
                    <Button
                      color='red'
                      disabled={stateGrafikKepuasan.delete.loading}
                      onClick={() => {
                        setSelectedId(item.uuid)
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
        {!mounted && !chartData ? (
          <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
            <Paper bg={colors['white-1']} p={'md'}>
              <Title pb={10} order={3}>Grafik Hasil Kepuasan Masyarakat</Title>
              <Text c='dimmed'>Belum ada data untuk ditampilkan dalam grafik</Text>
            </Paper>
          </Box>
        ) : (
          <Box style={{ width: '100%', minWidth: 300, height: 400, minHeight: 300 }}>
            <Paper bg={colors['white-1']} p={'md'}>
              <Title pb={10} order={4}>Grafik Hasil Kepuasan Masyarakat</Title>
              {mounted && chartData.length > 0 && (
                <BarChart width={isMobile ? 450 : isTablet ? 500 : 550} height={350} data={chartData} >
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="jumlah" fill={colors['blue-button']} name="Jumlah" />
                </BarChart>
              )}
            </Paper>
          </Box>
        )}
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
