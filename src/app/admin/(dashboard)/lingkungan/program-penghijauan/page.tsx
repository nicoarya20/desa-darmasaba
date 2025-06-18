'use client'
import { Box, Button, Image, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import HeaderSearch from '../../_com/header';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import colors from '@/con/colors';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function ProgramPenghijauan() {
  return (
   <Box>
    <HeaderSearch
    title='Program Penghijauan'
    placeholder='pencarian'
    searchIcon={<IconSearch size={20}/>}
    />
    <ListManfaatPenghijauan/>
   </Box>
  );
}

function ListManfaatPenghijauan() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <JudulList
          title='List Manfaat Program Penghijauan'
          href='/admin/lingkungan/program-penghijauan/create'
          />
          <Box style={{ overflowX: "auto" }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Nama Program Penghijauan</TableTh>
                  <TableTh>Gambar</TableTh>
                  <TableTh>Deskripsi</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                <TableTr>
                  <TableTd>
                    <Box w={100}>
                      <Text truncate="end" fz={"sm"}>Judul</Text>
                    </Box>
                  </TableTd>  
                  <TableTd>
                    <Image w={100}  alt="image" />
                  </TableTd>
                  <TableTd>Deskripsi</TableTd>
                  <TableTd>
                    <Button onClick={() => router.push('/admin/lingkungan/program-penghijauan/detail')}>
                      <IconDeviceImacCog size={25} />
                    </Button>
                  </TableTd>
                </TableTr>
              </TableTbody>
            </Table>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

export default ProgramPenghijauan;
