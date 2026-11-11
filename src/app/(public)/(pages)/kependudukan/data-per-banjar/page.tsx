'use client'
import colors from '@/con/colors';
import { Stack, Box, Paper, Text, Title, Skeleton, Table, Center } from '@mantine/core';
import { IconDatabaseOff } from '@tabler/icons-react';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
import { useProxy } from 'valtio/utils';
import dataBanjar from '@/app/admin/(dashboard)/_state/kependudukan/data-banjar';
import { useShallowEffect } from '@mantine/hooks';

function Page() {
  const state = useProxy(dataBanjar)

  useShallowEffect(() => {
    state.findMany.load()
  }, [])

  interface DataBanjarItem {
    id: string;
    nama: string;
    penduduk: number;
    kk: number;
    miskin: number;
    tahun: number;
  }

  const data = (state.findMany.data as DataBanjarItem[]) || [];

  if (state.findMany.loading) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"lg"}>
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>
        
        <Box px={{ base: 'md', md: 100 }}>
          <Title
            order={1}
            ta="center"
            c={colors["blue-button"]}
            fw="bold"
            lh={1.2}
          >
            Data Per Banjar
          </Title>
          <Text
            ta="center"
            fz={{ base: 'sm', md: 'md' }}
            lh={1.5}
            c="black"
          >
            Statistik kependudukan per banjar di Desa Darmasaba
          </Text>
        </Box>

        <Box px={{ base: "md", md: 100 }}>
          <Paper p="xl" withBorder>
            <Center py="xl">
              <Stack align="center" gap="md">
                <IconDatabaseOff size={80} color={colors.grey['2']} />
                <Text ta="center" fz="lg" fw={500} c="dimmed">
                  Data Belum Tersedia
                </Text>
                <Text ta="center" fz="sm" c="dimmed" maw={400}>
                  Data kependudukan per banjar untuk tahun ini belum diperbarui. 
                  Silakan hubungi administrator desa untuk informasi lebih lanjut.
                </Text>
              </Stack>
            </Center>
          </Paper>
        </Box>
      </Stack>
    )
  }

  const rows = data.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>{item.nama}</Table.Td>
      <Table.Td>{item.penduduk.toLocaleString('id-ID')}</Table.Td>
      <Table.Td>{item.kk.toLocaleString('id-ID')}</Table.Td>
      <Table.Td>{item.miskin.toLocaleString('id-ID')}</Table.Td>
    </Table.Tr>
  ));

  const totalPenduduk = data.reduce((sum, item) => sum + item.penduduk, 0);
  const totalKK = data.reduce((sum, item) => sum + item.kk, 0);
  const totalMiskin = data.reduce((sum, item) => sum + item.miskin, 0);

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"lg"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      
      <Box px={{ base: 'md', md: 100 }}>
        <Title
          order={1}
          ta="center"
          c={colors["blue-button"]}
          fw="bold"
          lh={1.2}
        >
          Data per Banjar
        </Title>
        <Text
          ta="center"
          fz={{ base: 'sm', md: 'md' }}
          lh={1.5}
          c="black"
        >
          Statistik kependudukan per banjar di Desa Darmasaba
        </Text>
      </Box>

      <Box px={{ base: "md", md: 100 }}>
        <Paper p="xl" withBorder>
          <Text fw={700} fz="lg" mb="md" c="black">
            Data Kependudukan per Banjar
          </Text>
          
          <Table.ScrollContainer minWidth={500}>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Banjar</Table.Th>
                  <Table.Th>Penduduk</Table.Th>
                  <Table.Th>Kepala Keluarga</Table.Th>
                  <Table.Th>Penduduk Miskin</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows}
                <Table.Tr fw={700} bg={colors.grey[1]}>
                  <Table.Td>Total</Table.Td>
                  <Table.Td>{totalPenduduk.toLocaleString('id-ID')}</Table.Td>
                  <Table.Td>{totalKK.toLocaleString('id-ID')}</Table.Td>
                  <Table.Td>{totalMiskin.toLocaleString('id-ID')}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      </Box>
    </Stack>
  );
}

export default Page;
