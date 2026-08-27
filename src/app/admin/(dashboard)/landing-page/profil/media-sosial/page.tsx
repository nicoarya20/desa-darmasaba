/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
  Image,
  Pagination,
  Paper,
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
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import profileLandingPageState from '../../../_state/landing-page/profile';
import { getSosmedHref, sosmedMap } from '../_lib/sosmed';

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
  const stateMediaSosial = useProxy(profileLandingPageState.mediaSosial);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay

  const getIconSource = (item: any) => {
    if (item.image?.link) return item.image.link;
    if (item.icon && sosmedMap[item.icon as keyof typeof sosmedMap]?.src) {
      return sosmedMap[item.icon as keyof typeof sosmedMap].src;
    }
    return null;
  };

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateMediaSosial.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', sm: 'md' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', sm: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', sm: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', sm: 'md' }}>
          <Title order={4} lh={1.15}>
            Daftar Media Sosial
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/landing-page/profil/media-sosial/create')}
            fz={{ base: 'xs', sm: 'sm' }}
          >
            Tambah Baru
          </Button>
        </Group>

        <Box>
          {/* Desktop: Table | Mobile: Card-based vertical layout */}
         <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
           <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false}>
              <TableThead>
                <TableTr>
                  <TableTh style={{ width: '25%' }}>
                    <Text fw={600} fz="md" lh={1.45}>
                      Nama Media Sosial / Kontak
                    </Text>
                  </TableTh>
                  <TableTh style={{ width: '20%' }}>
                    <Text fw={600} fz="md" lh={1.45}>
                      Gambar
                    </Text>
                  </TableTh>
                  <TableTh style={{ width: '20%' }}>
                    <Text fw={600} fz="md" lh={1.45}>
                      Link / No. Telepon
                    </Text>
                  </TableTh>
                  <TableTh style={{ width: '15%' }}>
                    <Text fw={600} fz="md" lh={1.45}>
                      Aksi
                    </Text>
                  </TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableTr key={item.id}>
                      <TableTd style={{ width: '25%' }}>
                        <Text fw={500} fz="md" lh={1.5} truncate="end" lineClamp={1}>
                          {item.name}
                        </Text>
                      </TableTd>
                      <TableTd style={{ width: '20%' }}>
                        <Box w={50} h={50} style={{ borderRadius: 8, overflow: 'hidden' }}>
                          {(() => {
                            const src = getIconSource(item);
                            if (src) {
                              return (
                                <Image
                                  loading="lazy"
                                  src={src}
                                  alt={item.name}
                                  fit={item.image?.link ? 'cover' : 'contain'}
                                />
                              );
                            }
                            return <Box bg={colors['blue-button']} w="100%" h="100%" />;
                          })()}
                        </Box>
                      </TableTd>
                      <TableTd style={{ width: '20%' }}>
                        <Box w={250}>
                          <Text truncate fz="sm" lh={1.5} c="dimmed" lineClamp={1}>
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
                          onClick={() =>
                            router.push(`/admin/landing-page/profil/media-sosial/${item.id}`)
                          }
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
                        <Text c="dimmed" fz="md" lh={1.5}>
                          Tidak ada data media sosial yang cocok
                        </Text>
                      </Center>
                    </TableTd>
                  </TableTr>
                )}
              </TableTbody>
            </Table>
          </Box>

          {/* Mobile layout */}
          <Stack hiddenFrom="md" gap="xs">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder p="sm" radius="md">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Nama Media Sosial / Kontak</Text>
                      <Text fw={500} fz="sm" lh={1.45}>
                        {item.name}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Gambar</Text>
                    </Box>
                    <Box w={40} h={40} style={{ borderRadius: 6, overflow: 'hidden' }}>
                      {(() => {
                        const src = getIconSource(item);
                        if (src) {
                          return (
                            <Image
                              loading="lazy"
                              src={src}
                              alt={item.name}
                              fit={item.image?.link ? 'cover' : 'contain'}
                            />
                          );
                        }
                        return <Box bg={colors['blue-button']} w="100%" h="100%" />;
                      })()}
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>Link / No. Telepon</Text>
                      {(() => {
                        const href = getSosmedHref(item.icon, item.iconUrl);
                        const label = item.iconUrl || '-';

                        if (!href) {
                          return (
                            <Text fz="sm" c="dimmed" truncate>
                              {label}
                            </Text>
                          );
                        }

                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'underline' }}
                          >
                            <Text fz="sm" c="blue" truncate>
                              {label}
                            </Text>
                          </a>
                        );
                      })()}
                    </Box>
                    <Group mt="sm" justify="flex-end">
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() =>
                          router.push(`/admin/landing-page/profil/media-sosial/${item.id}`)
                        }
                      >
                        Detail
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={24}>
                <Text c="dimmed" fz="sm" lh={1.5}>
                  Tidak ada data media sosial yang cocok
                </Text>
              </Center>
            )}
          </Stack>
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