import { Box, Paper, Stack, Table, TableTbody, TableTh, TableThead, TableTr, Title } from '@mantine/core';
import colors from '@/con/colors';
import React from 'react';

function ListPolsekTerdekat() {
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'} radius={10}>
        <Stack gap={'xs'}>
          <Title order={3}>List Polsek Terdekat</Title>
          <Box>
            <Table striped withTableBorder withColumnBorders withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh>Nama Polsek Terdekat</TableTh>
                  <TableTh>Jarak Polsek Terdekat</TableTh>
                  <TableTh>Alamat Polsek Terdekat</TableTh>
                  <TableTh>Nomor Telepon Polsek Terdekat</TableTh>
                  <TableTh>Jam Aktif</TableTh>
                  <TableTh>Deskripsi Polsek Terdekat</TableTh>
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

export default ListPolsekTerdekat;
