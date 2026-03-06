'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
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
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailFasilitasKesehatan() {
  const params = useParams();
  const router = useRouter();
  const state = useProxy(fasilitasKesehatanState.fasilitasKesehatan);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);

  const handleHapus = () => {
    if (selectedId) {
      state.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      router.push(
        '/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan'
      );
    }
  };

  if (!state.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = state.findUnique.data;

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      {/* Tombol Back */}
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      {/* Wrapper Detail */}
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
            Detail Fasilitas Kesehatan
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box pl={10}>
                <Text fz="lg" fw="bold">Nama Fasilitas</Text>
                <Text fz="md" c="dimmed">{data.name || '-'}</Text>
              </Box>

              <Box pl={10}>
                <Text fz="lg" fw="bold">Informasi Umum</Text>
                <Text fz="md" fw="bold">Fasilitas</Text>
                <Text fz="md" c="dimmed">{data.informasiumum?.fasilitas || '-'}</Text>
                <Text fz="md" fw="bold">Alamat</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data.informasiumum?.alamat || '-'}</Text>
                <Text fz="md" fw="bold">Jam Operasional</Text>
                <Text fz="md" c="dimmed">{data.informasiumum?.jamOperasional || '-'}</Text>
              </Box>

              <Box pl={10}>
                <Text fz="lg" fw="bold">Layanan Unggulan</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.layananunggulan?.content || '-' }} />
              </Box>

              <Box pl={10}>
                <Text fz="lg" fw="bold">Fasilitas Pendukung</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.fasilitaspendukung?.content || '-' }} />
              </Box>

              <Box pl={10}>
                <Text fz="lg" fw="bold">Prosedur Pendaftaran</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data.prosedurpendaftaran?.content || '-' }} />
              </Box>

              <Box pl={10}>
                <Text fz="lg" fw="bold" mb="sm">Dokter & Tenaga Medis</Text>
                {Array.isArray(data.dokterdantenagamedis) && data.dokterdantenagamedis.length > 0 ? (
                  <Box style={{ overflowX: 'auto', width: '100%' }}>
                    <Table striped highlightOnHover withTableBorder>
                      <TableThead>
                        <TableTr>
                          <TableTh style={{ whiteSpace: 'nowrap' }}>Nama</TableTh>
                          <TableTh style={{ whiteSpace: 'nowrap' }}>Spesialis</TableTh>
                          <TableTh style={{ whiteSpace: 'nowrap' }}>Jadwal</TableTh>
                          <TableTh style={{ whiteSpace: 'nowrap' }}>Jam Operasional</TableTh>
                        </TableTr>
                      </TableThead>
                      <TableTbody>
                        {data.dokterdantenagamedis.map((dokter) => (
                          <TableTr key={dokter.id}>
                            <TableTd style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                              {dokter.name || '-'}
                            </TableTd>
                            <TableTd style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                              {dokter.specialist || '-'}
                            </TableTd>
                            <TableTd style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                              {dokter.jadwal || '-'}
                            </TableTd>
                            <TableTd style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                              {dokter.jamBukaOperasional} – {dokter.jamTutupOperasional}
                              {dokter.jadwalLibur && (
                                <>
                                  <br />
                                  <Text span c="dimmed" fz="xs">
                                    Libur: {dokter.jadwalLibur} ({dokter.jamBukaLibur}–{dokter.jamTutupLibur})
                                  </Text>
                                </>
                              )}
                            </TableTd>
                          </TableTr>
                        ))}
                      </TableTbody>
                    </Table>
                  </Box>
                ) : (
                  <Text c="dimmed">Tidak ada dokter atau tenaga medis terdaftar.</Text>
                )}
              </Box>

              <Box pl={10} mt="xl">
                <Text fz="lg" fw="bold" mb="sm">Tarif & Layanan</Text>
                {Array.isArray(data.tarifdanlayanan) && data.tarifdanlayanan.length > 0 ? (
                  <Box style={{ overflowX: 'auto', width: '100%' }}>
                    <Table striped highlightOnHover withTableBorder>
                      <TableThead>
                        <TableTr>
                          <TableTh style={{ whiteSpace: 'nowrap' }}>Layanan</TableTh>
                          <TableTh style={{ whiteSpace: 'nowrap' }}>Tarif</TableTh>
                        </TableTr>
                      </TableThead>
                      <TableTbody>
                        {data.tarifdanlayanan.map((tarif) => (
                          <TableTr key={tarif.id}>
                            <TableTd style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                              {tarif.layanan || '-'}
                            </TableTd>
                            <TableTd style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                              {tarif.tarif || '-'}
                            </TableTd>
                          </TableTr>
                        ))}
                      </TableTbody>
                    </Table>
                  </Box>
                ) : (
                  <Text c="dimmed">Tidak ada tarif atau layanan terdaftar.</Text>
                )}
              </Box>

              {/* Aksi */}
              <Group gap="sm">
                <Button
                  color="red"
                  onClick={() => {
                    setSelectedId(data.id);
                    setModalHapus(true);
                  }}
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconTrash size={20} />
                </Button>

                <Button
                  color="green"
                  onClick={() =>
                    router.push(
                      `/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/${data.id}/edit`
                    )
                  }
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconEdit size={20} />
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus fasilitas kesehatan ini?"
      />
    </Box>
  );
}

export default DetailFasilitasKesehatan;
