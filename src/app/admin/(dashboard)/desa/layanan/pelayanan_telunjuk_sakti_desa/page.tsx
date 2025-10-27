// /* eslint-disable react-hooks/exhaustive-deps */
// 'use client'
// import colors from '@/con/colors';
// import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
// import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
// import { useRouter } from 'next/navigation';
// import { useEffect, useMemo, useState } from 'react';
// import { useProxy } from 'valtio/utils';
// import HeaderSearch from '../../../_com/header';
// import JudulList from '../../../_com/judulList';
// import stateLayananDesa from '../../../_state/desa/layananDesa';

// function PelayananTelunjukSakti() {
//   const [search, setSearch] = useState("");
//   return (
//     <Box>
//       <HeaderSearch
//         title='Posisi Organisasi'
//         placeholder='pencarian'
//         searchIcon={<IconSearch size={20} />}
//         value={search}
//         onChange={(e) => setSearch(e.currentTarget.value)}
//       />
//       <ListPelayananTelunjukSakti search={search} />
//     </Box>
//   );
// }

// function ListPelayananTelunjukSakti({ search }: { search: string }) {
//   const telunjukSaktiState = useProxy(stateLayananDesa.pelayananTelunjukSaktiDesa)
//   const router = useRouter()

//   const {
//     data,
//     page,
//     totalPages,
//     loading,
//     load,
//   } = telunjukSaktiState.findMany;

//   useEffect(() => {
//     load(page, 10)
//   }, [])

//   const filteredData = useMemo(() => {
//     if (!data) return [];
//     return data.filter(item => {
//       const keyword = search.toLowerCase();
//       return (
//         item.name?.toLowerCase().includes(keyword) ||
//         item.link?.toLowerCase().includes(keyword) ||
//         item.deskripsi?.toLowerCase().includes(keyword)
//       );
//     })
//       .sort((a, b) => a.posisi?.hierarki - b.posisi?.hierarki);
//   }, [data, search]);

//   if (loading || !data) {
//     return (
//       <Stack py={10}>
//         <Skeleton height={300} />
//       </Stack>
//     );
//   }

//   if (data.length === 0) {
//     return (
//       <Box py={10}>
//         <Paper bg={colors['white-1']} p={'md'}>
//           <JudulList
//             title='List Pelayanan Telunjuk Sakti Desa'
//             href='/admin/desa/layanan/pelayanan_telunjuk_sakti_desa/create'
//           />
//           <Table striped withTableBorder withRowBorders>
//             <TableThead>
//               <TableTr>
//                 <TableTh>Nama</TableTh>
//                 <TableTh>Link</TableTh>
//                 <TableTh>Detail</TableTh>
//               </TableTr>
//             </TableThead>
//             <TableTbody>
//               <TableTr>
//                 <TableTd colSpan={3}>
//                   <Text fz={"sm"} color="gray.5">
//                     Tidak ada data
//                   </Text>
//                 </TableTd>
//               </TableTr>
//             </TableTbody>
//           </Table>
//         </Paper>
//       </Box>
//     );
//   }

//   return (
//     <Box py={10}>
//       <Paper bg={colors['white-1']} p={'md'}>
//         <JudulList
//           title='List Pelayanan Telunjuk Sakti Desa'
//           href='/admin/desa/layanan/pelayanan_telunjuk_sakti_desa/create'
//         />
//         <Table striped withTableBorder withRowBorders>
//           <TableThead>
//             <TableTr>
//               <TableTh>Nama</TableTh>
//               <TableTh>Link</TableTh>
//               <TableTh>Detail</TableTh>
//             </TableTr>
//           </TableThead>
//           <TableTbody>
//             {filteredData.map((item) => (
//               <TableTr key={item.id}>
//                 <TableTd>
//                   <Box w={100}>
//                     <Text truncate="end" lineClamp={1} fz={"sm"} dangerouslySetInnerHTML={{ __html: item.name }} />
//                   </Box>
//                 </TableTd>
//                 <TableTd>
//                   <Box w={100}>
//                     <a href={item.link} target="_blank" rel="noopener noreferrer">
//                       <Text dangerouslySetInnerHTML={{ __html: item.deskripsi }} truncate="end" fz={"sm"} />
//                     </a>
//                   </Box>
//                 </TableTd>
//                 <TableTd>
//                   <Text>
//                     <Button onClick={() => router.push(`/admin/desa/layanan/pelayanan_telunjuk_sakti_desa/${item.id}`)}>
//                       <IconDeviceImac size={20} />
//                     </Button>
//                   </Text>
//                 </TableTd>
//               </TableTr>
//             ))}
//           </TableTbody>
//         </Table>
//       </Paper>
//       <Center>
//         <Pagination
//           value={page}
//           onChange={(newPage) => {
//             load(newPage, 10);
//             window.scrollTo(0, 0);
//           }}
//           total={totalPages}
//           mt="md"
//           mb="md"
//         />
//       </Center>
//     </Box>
//   );
// }

// export default PelayananTelunjukSakti;

/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
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
  Tooltip,
} from '@mantine/core';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateLayananDesa from '../../../_state/desa/layananDesa';

function PelayananTelunjukSakti() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Pelayanan Telunjuk Sakti"
        placeholder="Cari layanan..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPelayananTelunjukSakti search={search} />
    </Box>
  );
}

function ListPelayananTelunjukSakti({ search }: { search: string }) {
  const telunjukSaktiState = useProxy(stateLayananDesa.pelayananTelunjukSaktiDesa);
  const router = useRouter();

  const { data, page, totalPages, loading, load } = telunjukSaktiState.findMany;

  useEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={400} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Pelayanan Telunjuk Sakti</Title>
          <Tooltip label="Tambah Layanan" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() =>
                router.push('/admin/desa/layanan/pelayanan_telunjuk_sakti_desa/create')
              }
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover style={{ minWidth: '700px' }}>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '30%' }}>Nama</TableTh>
                <TableTh style={{ width: '40%' }}>Link</TableTh>
                <TableTh style={{ width: '30%' }}>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={200}>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.name}
                        </Text></Box>

                    </TableTd>
                    <TableTd>
                      <Box w={200}>
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          <Text lineClamp={1} dangerouslySetInnerHTML={{ __html: item.deskripsi }} style={{wordBreak: "break-word", whiteSpace: "normal"}} truncate="end" fz={"sm"} />
                        </a>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/admin/desa/layanan/pelayanan_telunjuk_sakti_desa/${item.id}`
                          )
                        }
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py={20}>
                      <Text color="dimmed">
                        Tidak ada data layanan yang cocok
                      </Text>
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
            load(newPage, 10, search);
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

export default PelayananTelunjukSakti;

