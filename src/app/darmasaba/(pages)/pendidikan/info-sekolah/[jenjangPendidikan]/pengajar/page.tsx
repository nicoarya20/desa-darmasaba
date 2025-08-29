'use client'
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import colors from '@/con/colors';
import { Box, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { IconSchool, IconLayersSubtract } from '@tabler/icons-react';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import { use } from 'react';


interface PageProps {
  params: Promise<{ jenjangPendidikan: string }>
}

function Page({ params }: PageProps) {
  const stateList = useProxy(infoSekolahPaud.pengajar)
  const { jenjangPendidikan } = use(params);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateList.findMany

  useShallowEffect(() => {
    // Decode the URL parameter and pass it to load
    const decodedJenjang = decodeURIComponent(jenjangPendidikan).toLowerCase()
    load(page, 10, '', decodedJenjang === 'semua' ? '' : decodedJenjang)
  }, [page, jenjangPendidikan])

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
            <IconSchool size={28} stroke={1.5} color={colors['blue-button']} />
            <Title order={2} fz="xl">Daftar Pengajar</Title>
          </Group>
        </Group>

        {filteredData.length === 0 ? (
          <Stack align="center" justify="center" py="xl" gap="sm">
            <IconLayersSubtract size={48} stroke={1.5} color={"gray"} />
            <Text fz="lg" c="dimmed">Belum ada data pengajar</Text>
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
                <TableTh w="30%">Nama Pengajar</TableTh>
                <TableTh w="30%">Nama Lembaga</TableTh>
                <TableTh w="40%">Jenjang Pendidikan</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd fw={500}>{item.nama}</TableTd>
                  <TableTd>{item.lembaga.nama}</TableTd>
                  <TableTd>{item.lembaga.jenjangPendidikan?.nama || '-'}</TableTd>
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
