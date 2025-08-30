'use client'
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import colors from '@/con/colors';
import { Box, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconChalkboard, IconLayersSubtract, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function Page() {
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebouncedValue(search, 500); // 500ms delay
  const stateList = useProxy(infoSekolahPaud.lembagaPendidikan)

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateList.findMany

  useShallowEffect(() => {
    load(page, 10, debouncedSearch)
  }, [page, debouncedSearch])

  const filteredData = data || []

  if (loading || !data) {
    return (
      <Stack py="lg" gap="md">
        <Skeleton h={40} radius="xl" />
        <Skeleton h={500} radius="md" />
      </Stack>
    )
  }

  return (
    <Box py="lg">
      <Paper
        bg={colors['white-1']}
        p="lg"
        radius="xl"
        shadow="sm"
        withBorder
      >
        <Group justify="space-between" align="center" mb="md">
          <Group gap="sm">
            <IconChalkboard size={28} stroke={1.5} color={colors['blue-button']} />
            <Title order={2} fz="xl">Daftar Lembaga Pendidikan</Title>
          </Group>
          <TextInput
            placeholder='pencarian'
            leftSection={<IconSearch size={20} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </Group>

        {filteredData.length === 0 ? (
          <Stack align="center" justify="center" py="xl" gap="sm">
            <IconLayersSubtract size={48} stroke={1.5} color={"gray"} />
            <Text fz="lg" c="dimmed">Belum ada data lembaga pendidikan</Text>
          </Stack>
        ) : (
          <Table
            striped
            highlightOnHover
            withTableBorder
            withRowBorders
            horizontalSpacing="md"
            verticalSpacing="sm"
            fz="sm"
          >
            <TableThead>
              <TableTr>
                <TableTh w="60%">Nama Lembaga</TableTh>
                <TableTh w="40%">Jenjang Pendidikan</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd fw={500}>{item.nama}</TableTd>
                  <TableTd>{item.jenjangPendidikan?.nama || '-'}</TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        )}
      </Paper>

      {filteredData.length > 0 && (
        <Center mt="lg">
          <Pagination
            value={page}
            onChange={(newPage) => load(newPage)}
            total={totalPages}
            size="md"
            radius="xl"
            withEdges
          />
        </Center>
      )}
    </Box>
  );
}

export default Page;
