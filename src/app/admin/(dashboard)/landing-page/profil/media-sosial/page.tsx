'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Image, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import profileLandingPageState from '../../../_state/landing-page/profile';

function MediaSosial() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Media Sosial'
        placeholder='Cari nama media sosial atau kontak...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListMediaSosial search={search} />
    </Box>
  );
}

function ListMediaSosial({ search }: { search: string }) {
  const stateMediaSosial = useProxy(profileLandingPageState.mediaSosial)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateMediaSosial.findMany;

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Media Sosial</Title>
            <Button leftSection={<IconPlus size={18} />} color="blue" variant="light" onClick={() => router.push('/admin/landing-page/profil/media-sosial/create')}>
              Tambah Baru
            </Button>
        </Group>
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>Nama Media Sosial / Kontak</TableTh>
                <TableTh style={{ width: '20%' }}>Gambar</TableTh>
                <TableTh style={{ width: '20%' }}>Link / No. Telepon</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '25%', }}>
                      <Text fw={500} truncate="end" lineClamp={1}>{item.name}</Text>
                    </TableTd>
                    <TableTd style={{ width: '20%', }}>
                      <Box w={50} h={50} style={{ borderRadius: 8, overflow: 'hidden', }}>
                        {item.image?.link ? (
                          <Image loading='lazy' src={item.image.link} alt={item.name} fit="cover" />
                        ) : (
                          <Box bg={colors['blue-button']} w="100%" h="100%" />
                        )}
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '20%', }}>
                      <Box w={250}>
                        <Text truncate fz="sm" c="dimmed" lineClamp={1}>
                          {item.iconUrl || item.noTelp || '-'}
                        </Text>
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '15%' }}>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() => router.push(`/admin/landing-page/profil/media-sosial/${item.id}`)}
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data media sosial yang cocok</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
      </Paper>
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default MediaSosial;
