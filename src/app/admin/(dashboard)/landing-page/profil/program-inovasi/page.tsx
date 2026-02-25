'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import DOMPurify from 'dompurify';
import HeaderSearch from '../../../_com/header';
import profileLandingPageState from '../../../_state/landing-page/profile';

function ProgramInovasi() {
  const [search, setSearch] = useState("");

  return (
    <Box px={{ base: 0, md: "md" }} py="lg">
      <HeaderSearch
        title="Program Inovasi"
        placeholder="Cari program inovasi..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListProgramInovasi search={search} />
    </Box>
  );
}

function ListProgramInovasi({ search }: { search: string }) {
  const stateProgramInovasi = useProxy(profileLandingPageState.programInovasi);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay

  const { data, page, totalPages, loading, load } = stateProgramInovasi.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={20}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={15}>
      <Paper bg={colors['white-1']} withBorder p="lg" radius="md" shadow="sm">
        <Group justify='space-between'>
          <Title order={4}>Daftar Program Inovasi</Title>
          <Button
            color="blue"
            leftSection={<IconPlus size={18} />}
            variant="light"
            radius="md"
            onClick={() => router.push('/admin/landing-page/profil/program-inovasi/create')}
          >
            Tambah Program
          </Button>
        </Group>
        <Box visibleFrom='md' style={{ overflowX: 'auto' }}>
         <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false} striped verticalSpacing="sm">
            <TableThead>
              <TableTr>
                <TableTh>Nama Program</TableTh>
                <TableTh>Deskripsi</TableTh>
                <TableTh>Link</TableTh>
                <TableTh>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length === 0 ? (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">Belum ada data program inovasi</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              ) : (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500}>{item.name}</Text>
                    </TableTd>
                    <TableTd style={{ maxWidth: 250 }}>
                      <Text fz="sm" lineClamp={1} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.description || '-') }}></Text>
                    </TableTd>
                    <TableTd style={{ maxWidth: 250 }}>
                      <Tooltip label="Buka tautan program" position="top" withArrow>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: colors['blue-button'], textDecoration: 'underline' }}
                        >
                          <Text truncate fz="sm">{item.link}</Text>
                        </a>
                      </Tooltip>
                    </TableTd>
                    <TableTd>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() =>
                          router.push(`/admin/landing-page/profil/program-inovasi/${item.id}`)
                        }
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              )}
            </TableTbody>
          </Table>
        </Box>
        <Box hiddenFrom="md" pt={20}>
          <Stack gap="sm">
            {filteredData.map((item) => (
              <Paper
                key={item.id}
                withBorder
                radius="md"
                p="md"
                shadow="xs"
              >
                <Stack gap={6}>
                  {/* Title */}
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Nama Program</Text>
                    <Text fw={500} lh={1.4}>{item.name}</Text>
                  </Box>

                  {/* Description */}
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Deskripsi</Text>
                    <Text dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.description || '-') }} fz="sm" c="gray.7" lineClamp={2} />
                  </Box>

                  {/* Link */}
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Link</Text>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'underline' }}
                    >
                      <Text
                        fz="sm"
                        c="blue"
                        truncate
                      >
                        {item.link}
                      </Text>
                    </a>
                  </Box>

                  {/* Action */}
                  <Group justify="flex-end" mt="xs">
                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImacCog size={16} />}
                      onClick={() =>
                        router.push(
                          `/admin/landing-page/profil/program-inovasi/${item.id}`
                        )
                      }
                    >
                      Detail
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>

        {filteredData.length > 0 && (
          <Center mt="md">
            <Pagination
              value={page}
              onChange={(newPage) => {
                load(newPage, 10);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              total={totalPages}
              color="blue"
            />
          </Center>
        )}
      </Paper>
    </Box>
  );
}

export default ProgramInovasi;
