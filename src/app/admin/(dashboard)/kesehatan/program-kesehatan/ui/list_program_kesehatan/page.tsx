import { Box, Paper, Stack, Table, TableTbody, TableTh, TableThead, TableTr, Title } from '@mantine/core';
import colors from '@/con/colors';
import React from 'react';

function ListProgramKesehatan() {
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'} radius={10}>
        <Stack gap={'xs'}>
          <Title order={3}>List Program Kesehatan</Title>
          <Box>
            <Table striped withRowBorders withColumnBorders withTableBorder>
            <TableThead>
              <TableTr>
                <TableTh>Deskripsi Program Kesehatan</TableTh>
                <TableTh>Nama Konten Program Kesehatan</TableTh>
                <TableTh>Deskripsi Konten Program Kesehatan</TableTh>
                <TableTh>Aksi</TableTh>
                <TableTh>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
            
            </TableTbody>
            </Table>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ListProgramKesehatan;
