'use client'
import colors from '@/con/colors';
import { Box, Button, Image, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function DesaDigitalSmartVillage() {
  return (
    <Box>
      <HeaderSearch
        title='Desa Digital Smart Village'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListDesaDigitalSmartVillage/>
    </Box>
  );
}

function ListDesaDigitalSmartVillage() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Desa Digital Smart Village'
          href='/admin/inovasi/desa-digital-smart-village/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Inovasi</TableTh>
              <TableTh>Deskripsi Singkat Inovasi</TableTh>
              <TableTh>Image</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Layanan Admin Digital</TableTd>
              <TableTd>Deskripsi Singkat Inovasi</TableTd>
              <TableTd>
                <Image src={"/"} alt=''/>
              </TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/inovasi/desa-digital-smart-village/detail')}>
                  <IconDeviceImac size={20} />
                </Button>
              </TableTd>
            </TableTr>
          </TableTbody>
        </Table>  
      </Paper>
    </Box>
  );
}

export default DesaDigitalSmartVillage;
