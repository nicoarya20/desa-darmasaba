'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import laporanPublikState from '@/app/admin/(dashboard)/_state/keamanan/laporan-publik';
import colors from '@/con/colors';
import { Box, Button, Center, ColorSwatch, Flex, Group, Modal, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDebouncedValue, useDisclosure, useShallowEffect } from '@mantine/hooks';
import { IconArrowRight, IconPlus, IconSearch } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const [search, setSearch] = useState("");
  const router = useTransitionRouter()
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [opened, { open, close }] = useDisclosure(false);
  const stateLaporan = useProxy(laporanPublikState);
  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateLaporan.findMany;

  useShallowEffect(() => {
    load(page, 6, debouncedSearch);
  }, [page, debouncedSearch]);

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  const resetForm = () => {
    stateLaporan.create.form = {
      judul: '',
      lokasi: '',
      tanggalWaktu: '',
      kronologi: '',
    };
  };

  const handleSubmit = async () => {
    await stateLaporan.create.create();
    resetForm();
  };
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <Group justify="space-between" align="center">
          <BackButton />
          <TextInput
              radius={"lg"}
              placeholder='Cari Laporan Publik'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={20} />}
              w={{ base: "100%", md: "30%" }}
            />
        </Group>
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Group justify="space-between">
          <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
            Laporan Keamanan Lingkungan
          </Text>
          <Button
            onClick={open}
            bg={colors['blue-button']}
            size="md"
            radius="md"
            rightSection={<IconPlus size={20} />}
          >
            Tambah Laporan
          </Button>
        </Group>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <Flex justify={'space-between'} align={'center'}>
            <Text fz={{ base: 'sm', md: 'h4' }} fw={'bold'}>Laporan Terbaru</Text>
            <Box>
              <Flex gap={'lg'}>
                <Box>
                  <Flex gap={{ base: 2, md: 5 }} align={'center'}>
                    <Text fz={{ base: 'sm', md: 'h4' }}>Terselesaikan</Text>
                    <ColorSwatch color="#2A742D" size={20} />
                  </Flex>
                </Box>
                <Box>
                  <Flex gap={{ base: 2, md: 5 }} align={'center'}>
                    <Text fz={{ base: 'sm', md: 'h4' }}>Dalam Proses</Text>
                    <ColorSwatch color="#D1961F" size={20} />
                  </Flex>
                </Box>
                <Box>
                  <Flex gap={{ base: 2, md: 5 }} align={'center'}>
                    <Text fz={{ base: 'sm', md: 'h4' }}>Gagal</Text>
                    <ColorSwatch color="#A34437" size={20} />
                  </Flex>
                </Box>
              </Flex>
            </Box>
          </Flex>
          <SimpleGrid
            cols={{
              base: 1,
              md: 3
            }}
          >
            {data.map((v, k) => {
              return (
                <Paper radius={'lg'} key={k} bg={colors['white-trans-1']} p={'xl'}>
                  <Stack>
                    <Text c={colors['blue-button']} lineClamp={3} truncate="end" fz="h4" fw="bold">{v.judul}</Text>
                    <Text fs={'italic'} fz={'xl'}>
                      {v.tanggalWaktu
                        ? new Date(v.tanggalWaktu).toLocaleString('id-ID')
                        : '-'}
                    </Text>
                    <Box>
                      <Text fw={'bold'}>Penanganan:</Text>
                      {v.penanganan?.length ? (
                        v.penanganan.map((item, index) => (
                          <Box key={index}>
                            <Text
                              fz="md"
                              c="dimmed"
                              dangerouslySetInnerHTML={{ __html: item.deskripsi || '-' }}
                              style={{wordBreak: "break-word", whiteSpace: "normal"}}
                            />
                          </Box>
                        ))
                      ) : (
                        <Text fz="sm" fs="italic" c="dimmed">
                          Belum ada penanganan
                        </Text>
                      )}
                    </Box>
                    <Box
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        backgroundColor:
                          v.status === 'Selesai' ? '#94EF95FF' :
                            v.status === 'Proses' ? '#F1D295FF' :
                              '#F38E8EFF',
                        color:
                          v.status === 'Selesai' ? '#01BA01FF' :
                            v.status === 'Proses' ? '#B67A00FF' :
                              '#AE1700FF',
                        fontWeight: 900,
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        minWidth: '80px',
                      }}
                    >
                      {v.status}
                    </Box>
                    <Button
                      bg={colors['blue-button']}
                      rightSection={<IconArrowRight size={20} color={colors['white-1']} />}
                      onClick={() => router.push(`/darmasaba/keamanan/laporan-publik/${v.id}`)}
                    >Lihat Detail Kronologi
                    </Button>
                  </Stack>
                </Paper>
              )
            })}
          </SimpleGrid>
          <Center>
            <Pagination
              value={page}
              onChange={(newPage) => load(newPage)}
              total={totalPages}
              my="md"
            />
          </Center>
        </Stack>
      </Box>
      <Modal opened={opened} onClose={close} title="Tambah Laporan Publik">
        <Paper
          bg={colors['white-1']}
          p="lg"
          radius="md"
          shadow="sm"
          style={{ border: '1px solid #e0e0e0' }}
        >
          <Stack gap="md">
            <TextInput
              defaultValue={stateLaporan.create.form.judul}
              onChange={(e) => (stateLaporan.create.form.judul = e.target.value)}
              label={<Text fw="bold" fz="sm">Judul Laporan Publik</Text>}
              placeholder="Masukkan judul laporan publik"
              required
            />

            <TextInput
              defaultValue={stateLaporan.create.form.lokasi}
              onChange={(e) => (stateLaporan.create.form.lokasi = e.target.value)}
              label={<Text fw="bold" fz="sm">Lokasi Laporan Publik</Text>}
              placeholder="Masukkan lokasi laporan publik"
              required
            />

            <DateTimePicker
              label={<Text fw="bold" fz="sm">Tanggal Laporan Publik</Text>}
              defaultValue={
                stateLaporan.create.form.tanggalWaktu
                  ? new Date(stateLaporan.create.form.tanggalWaktu)
                  : null
              }
              onChange={(val) => {
                stateLaporan.create.form.tanggalWaktu = val ? val.toString() : '';
              }}
            />

            <Box>
              <Text fz="sm" fw="bold" mb={6}>
                Kronologi
              </Text>
              <CreateEditor
                value={stateLaporan.create.form.kronologi}
                onChange={(htmlContent) => {
                  stateLaporan.create.form.kronologi = htmlContent;
                }}
              />
            </Box>

            <Group justify="right">
              <Button
                onClick={handleSubmit}
                radius="md"
                size="md"
                style={{
                  background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                  color: '#fff',
                  boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
                }}
              >
                Simpan
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Modal>
    </Stack>
  );
}

export default Page;
