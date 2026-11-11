'use client'

import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import laporanPublikState from '@/app/admin/(dashboard)/_state/keamanan/laporan-publik';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  ColorSwatch,
  Flex,
  Group,
  Modal,
  Pagination,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDebouncedValue, useDisclosure, useMediaQuery, useShallowEffect } from '@mantine/hooks';
import { IconArrowRight, IconPlus, IconSearch } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';

function Page() {
  const mobile = useMediaQuery('(max-width: 768px)');
  const [search, setSearch] = useState('');
  const router = useTransitionRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);
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
    close();
  };

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      {/* Header: Back + Search */}
      <Box px={{ base: 'md', md: 100 }}>
        <Group justify="space-between" align="center">
          <BackButton />
          <TextInput
            radius="lg"
            placeholder="Cari Laporan Publik"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSection={<IconSearch size={20} />}
            w={{ base: '100%', md: '30%' }}
            size={mobile ? 'sm' : 'md'}
          />
        </Group>
      </Box>

      {/* Title + Add Button */}
      <Box px={{ base: 'md', md: 100 }}>
        <Group justify="space-between" align="flex-start">
          <Text
            ta="center"
            fz={{ base: 'xl', sm: '2xl', md: '2.5rem' }}
            c={colors['blue-button']}
            fw="bold"
            lineClamp={2}
            style={{ wordBreak: 'break-word' }}
          >
            Laporan Keamanan Lingkungan
          </Text>
          <Button
            onClick={open}
            bg={colors['blue-button']}
            size={mobile ? 'sm' : 'md'}
            radius="md"
            rightSection={<IconPlus size={20} />}
          >
            {mobile ? 'Tambah' : 'Tambah Laporan'}
          </Button>
        </Group>
      </Box>

      {/* Legend Status */}
      <Box px={{ base: 'md', md: 100 }}>
        <Flex
          justify="space-between"
          align="center"
          direction={mobile ? 'column' : 'row'}
          gap={mobile ? 'xs' : 'lg'}
        >
          <Text fz={{ base: 'sm', md: 'h4' }} fw="bold">
            Laporan Terbaru
          </Text>
          <Flex
            gap={mobile ? 'xs' : 'lg'}
            wrap="wrap"
            justify={mobile ? 'center' : 'flex-start'}
            align="center"
          >
            <Flex gap={2} align="center">
              <ColorSwatch color="#2A742D" size={16} />
              <Text fz={{ base: 'xs', md: 'sm' }}>Terselesaikan</Text>
            </Flex>
            <Flex gap={2} align="center">
              <ColorSwatch color="#D1961F" size={16} />
              <Text fz={{ base: 'xs', md: 'sm' }}>Dalam Proses</Text>
            </Flex>
            <Flex gap={2} align="center">
              <ColorSwatch color="#A34437" size={16} />
              <Text fz={{ base: 'xs', md: 'sm' }}>Gagal</Text>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      {/* Cards Grid */}
      <Box px={{ base: 'md', md: 100 }}>
        <SimpleGrid
          cols={{
            base: 1,
            md: 3,
          }}
          spacing="lg"
        >
          {data.map((v, k) => (
            <Paper
              key={k}
              radius="lg"
              bg={colors['white-trans-1']}
              p="lg"
              shadow="sm"
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                },
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <Stack gap="sm" style={{ flex: 1 }}>
                <Text
                  c={colors['blue-button']}
                  lineClamp={2}
                  fz={{ base: 'lg', md: 'xl' }}
                  fw="bold"
                  style={{ wordBreak: 'break-word' }}
                >
                  {v.judul}
                </Text>

                <Text
                  fs="italic"
                  fz={{ base: 'sm', md: 'md' }}
                  c="dimmed"
                >
                  {v.tanggalWaktu
                    ? new Date(v.tanggalWaktu).toLocaleString('id-ID')
                    : '-'}
                </Text>

                <Box style={{ flex: 1 }}>
                  <Text fw="bold" fz="sm">
                    Penanganan:
                  </Text>
                  {v.penanganan?.length ? (
                    v.penanganan.map((item, index) => (
                      <Box key={index}>
                        <Text
                          fz="xs"
                          c="dimmed"
                          dangerouslySetInnerHTML={{
                            __html: item.deskripsi || '-',
                          }}
                          style={{
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                            maxHeight: '80px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        />
                      </Box>
                    ))
                  ) : (
                    <Text fz="xs" fs="italic" c="dimmed">
                      Belum ada penanganan
                    </Text>
                  )}
                </Box>

                <Box
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor:
                      v.status === 'Selesai'
                        ? '#94EF95FF'
                        : v.status === 'Proses'
                        ? '#F1D295FF'
                        : '#F38E8EFF',
                    color:
                      v.status === 'Selesai'
                        ? '#01BA01FF'
                        : v.status === 'Proses'
                        ? '#B67A00FF'
                        : '#AE1700FF',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    minWidth: '70px',
                  }}
                >
                  {v.status}
                </Box>

                <Button
                  bg={colors['blue-button']}
                  rightSection={
                    <IconArrowRight
                      size={18}
                      color={colors['white-1']}
                    />
                  }
                  onClick={() => router.push(`/keamanan/laporan-publik/${v.id}`)}
                  size={mobile ? 'sm' : 'md'}
                  fullWidth
                  style={{ marginTop: 'auto' }}
                >
                  {mobile ? 'Detail' : 'Lihat Detail Kronologi'}
                </Button>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Box>

      {/* Pagination */}
      <Center px={{ base: 'md', md: 100 }}>
        <Pagination
          value={page}
          onChange={(newPage) => load(newPage)}
          total={totalPages}
          my="md"
          size={mobile ? 'sm' : 'md'}
        />
      </Center>

      {/* Modal Form */}
      <Modal opened={opened} onClose={close} title="Tambah Laporan Publik" size="xl">
        <Paper
          bg={colors['white-1']}
          p="lg"
          radius="md"
          shadow="sm"
          style={{ border: '1px solid #e0e0e0' }}
        >
          <Stack gap="md">
            <TextInput
              value={stateLaporan.create.form.judul}
              onChange={(e) =>
                (stateLaporan.create.form.judul = e.target.value)
              }
              label={<Text fw="bold" fz="sm">Judul Laporan Publik</Text>}
              placeholder="Masukkan judul laporan publik"
              required
              w="100%"
              size={mobile ? 'sm' : 'md'}
            />

            <TextInput
              value={stateLaporan.create.form.lokasi}
              onChange={(e) =>
                (stateLaporan.create.form.lokasi = e.target.value)
              }
              label={<Text fw="bold" fz="sm">Lokasi Laporan Publik</Text>}
              placeholder="Masukkan lokasi laporan publik"
              required
              w="100%"
              size={mobile ? 'sm' : 'md'}
            />

            <DateTimePicker
              label={<Text fw="bold" fz="sm">Tanggal Laporan Publik</Text>}
              value={
                stateLaporan.create.form.tanggalWaktu
                  ? new Date(stateLaporan.create.form.tanggalWaktu)
                  : null
              }
              onChange={(val) => {
                stateLaporan.create.form.tanggalWaktu = val ? val.toString() : '';
              }}
              w="100%"
              size={mobile ? 'sm' : 'md'}
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
                size={mobile ? 'sm' : 'md'}
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