/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useProxy } from 'valtio/utils';

import {
  Box,
  Button,
  Group,
  Image,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text
} from '@mantine/core';
import { IconArrowBack, IconEdit, IconFile, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import colors from '@/con/colors';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import apbdes from '../../../_state/landing-page/apbdes';
import RealisasiManager from './RealisasiManager';



function DetailAPBDes() {
  const apbdesState = useProxy(apbdes);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (!params?.id) return;
    apbdesState.findUnique.load(params.id as string);
  }, [params?.id]);

  const handleHapus = () => {
    if (selectedId) {
      apbdesState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push('/admin/landing-page/apbdes');
    }
  };

  if (!apbdesState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  const data = apbdesState.findUnique.data;

  // Helper: indentasi berdasarkan level
  const getIndent = (level: number) => ({
    paddingLeft: `${(level - 1) * 20}px`,
  });

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      <Paper
        withBorder
        w={{ base: '100%', md: '70%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail APBDes
          </Text>

          {/* Info Header */}
          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="md">
              <Box>
                <Text fz="lg" fw="bold">Nama APBDes</Text>
                <Text fz="md" c="dimmed">
                  {data.name || `APBDes Tahun ${data.tahun}`}
                </Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Tahun</Text>
                <Text fz="md" c="dimmed">
                  {data.tahun || '-'}
                </Text>
              </Box>

              {data.deskripsi && (
                <Box>
                  <Text fz="lg" fw="bold">Deskripsi</Text>
                  <Text fz="md" c="dimmed">
                    {data.deskripsi}
                  </Text>
                </Box>
              )}

              {data.jumlah && (
                <Box>
                  <Text fz="lg" fw="bold">Jumlah Total</Text>
                  <Text fz="md" c="dimmed">
                    {data.jumlah}
                  </Text>
                </Box>
              )}

              <Box>
                <Text fz="lg" fw="bold">Gambar</Text>
                {data.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt={data.name || 'Gambar APBDes'}
                    w={200}
                    height={150}
                    radius="md"
                    fit="contain"
                    style={{ border: '1px solid #ddd' }}
                    loading="lazy"
                  />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada gambar</Text>
                )}
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Dokumen</Text>
                {data.file?.link ? (
                  <Button
                    component="a"
                    href={data.file.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="light"
                    leftSection={<IconFile size={18} />}
                    size="sm"
                    mt="xs"
                  >
                    Lihat Dokumen
                  </Button>
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada dokumen</Text>
                )}
              </Box>

              <Group gap="sm" mt="md">
                <Button
                  color="red"
                  onClick={() => {
                    setSelectedId(data.id);
                    setModalHapus(true);
                  }}
                  disabled={apbdesState.delete.loading}
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconTrash size={20} />
                </Button>

                <Button
                  color="green"
                  onClick={() => router.push(`/admin/landing-page/apbdes/${data.id}/edit`)}
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconEdit size={20} />
                </Button>
              </Group>
            </Stack>
          </Paper>

          {/* Tabel Items */}
          {data.items && data.items.length > 0 ? (
            <Stack gap="md">
              <Text fz="lg" fw="bold">
                Rincian Pendapatan & Belanja ({data.items.length} item)
              </Text>
              <Table striped highlightOnHover>
                <TableThead>
                  <TableTr>
                    <TableTh>Uraian</TableTh>
                    <TableTh>Anggaran (Rp)</TableTh>
                    <TableTh>Realisasi (Rp)</TableTh>
                    <TableTh>Selisih (Rp)</TableTh>
                    <TableTh>Persentase (%)</TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {[...data.items]
                    .sort((a, b) => a.kode.localeCompare(b.kode))
                    .map((item) => (
                      <TableTr key={item.id}>
                        <TableTd style={getIndent(item.level)}>
                          <Group>
                            <Text fw={item.level === 1 ? 'bold' : 'normal'}>{item.kode}</Text>
                            <Text fz="sm" c="dimmed">{item.uraian}</Text>
                          </Group>
                        </TableTd>
                        <TableTd>{item.anggaran.toLocaleString('id-ID')}</TableTd>
                        <TableTd>{item.totalRealisasi.toLocaleString('id-ID')}</TableTd>
                        <TableTd>
                          <Text c={item.selisih >= 0 ? 'green' : 'red'}>
                            {item.selisih.toLocaleString('id-ID')}
                          </Text>
                        </TableTd>
                        <TableTd>
                          <Text fw={500}>{item.persentase.toFixed(2)}%</Text>
                        </TableTd>
                      </TableTr>
                    ))}
                </TableTbody>
              </Table>

              {/* Realisasi Manager untuk setiap item */}
              {data.items.map((item) => (
                <RealisasiManager
                  key={item.id}
                  itemId={item.id}
                  itemKode={item.kode}
                  itemUraian={item.uraian}
                  itemAnggaran={item.anggaran}
                  itemTotalRealisasi={item.totalRealisasi}
                  itemPersentase={item.persentase}
                  realisasiItems={item.realisasiItems || []}
                />
              ))}
            </Stack>
          ) : (
            <Text>Belum ada data item</Text>
          )}
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus APBDes ini?"
      />
    </Box>
  );
}

export default DetailAPBDes;